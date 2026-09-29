/**
 * Application state for the journal prototype.
 *
 * Holds the submissions, issues and settings, and exposes workflow actions.
 * All status changes go through `applyTransition`, which validates the move
 * against the workflow definition, updates the audit log, and — for direct
 * publication — links the article into a chosen issue.
 *
 * @module store/useJournalStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SUBMISSION_STATUS as S } from '../domain/status'
import { canTransition, buildActivityFor, TRANSITIONS } from '../domain/workflow'
import { submissions as seedSubmissions } from '../data/submissions'
import { issues as seedIssues, hydratePublishedMetadata } from '../data/issues'
import { defaultSettings, journal } from '../data/journal'
import { users, demoIdentities } from '../data/users'

/** Deep-clone the seed data so every reload of the prototype starts clean. */
const freshSubmissions = () => {
  const list = JSON.parse(JSON.stringify(seedSubmissions))
  hydratePublishedMetadata(list)
  return list
}
const freshIssues = () => JSON.parse(JSON.stringify(seedIssues))

let idCounter = 0
const nextId = (prefix) => {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

let submissionCounter = 148
const nextSubmissionId = () => {
  submissionCounter += 1
  return `JASSD-2026-${String(submissionCounter).padStart(4, '0')}`
}

const today = () => new Date().toISOString().slice(0, 10)

const useJournalStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────
      submissions: freshSubmissions(),
      issues: freshIssues(),
      users: JSON.parse(JSON.stringify(users)),
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      journal,
      activeRole: 'EDITOR',

      // ── Role ─────────────────────────────────────────────────────────
      setRole: (role) => set({ activeRole: role }),

      /** The mock identity signed in for the active role. */
      identity: () => demoIdentities[get().activeRole],

      // ── Submissions ──────────────────────────────────────────────────
      addSubmission: (draft) =>
        set((state) => {
          const id = nextSubmissionId()
          const submission = {
            id,
            title: draft.title,
            abstract: draft.abstract,
            keywords: draft.keywords,
            status: S.SUBMITTED,
            articleType: draft.articleType,
            section: draft.section || 'Unassigned',
            submitted: today(),
            lastActivity: today(),
            assignedEditorId: null,
            authors: draft.authors,
            reviews: [],
            files: draft.files,
            activity: [
              {
                id: nextId('a'),
                submissionId: id,
                type: 'SUBMISSION_RECEIVED',
                label: 'Manuscript submitted to the journal.',
                actor: draft.authors[0]?.name ?? 'Author',
                actorRole: 'AUTHOR',
                timestamp: today(),
              },
            ],
          }
          return { submissions: [submission, ...state.submissions] }
        }),

      updateSubmission: (id, patch) =>
        set((state) => ({
          submissions: state.submissions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      assignEditor: (submissionId, editorId, actor) =>
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id !== submissionId) return s
            const editor = state.users.find((u) => u.id === editorId)
            return {
              ...s,
              assignedEditorId: editorId,
              lastActivity: today(),
              activity: [
                ...s.activity,
                {
                  id: nextId('a'),
                  submissionId,
                  type: 'EDITOR_ASSIGNED',
                  label: `Assigned to ${editor?.name ?? 'an editor'} as handling editor.`,
                  actor: actor.name,
                  actorRole: actor.role,
                  timestamp: today(),
                },
              ],
            }
          }),
        })),

      /**
       * Apply a workflow transition.
       *
       * Validates the move, records the audit entry, and — when publishing —
       * links the article into an issue and assigns its volume/issue/pages.
       *
       * @returns {{ok: boolean, error?: string, submission?: object}}
       */
      applyTransition: (name, submissionId, opts = {}) => {
        const { actor, reason, issueId, publicationDate } = opts
        const state = get()
        const submission = state.submissions.find((s) => s.id === submissionId)
        if (!submission) return { ok: false, error: 'Submission not found.' }

        const transition = TRANSITIONS[name]
        if (!transition) return { ok: false, error: `Unknown action "${name}".` }

        if (!canTransition(name, submission.status, actor?.role)) {
          return {
            ok: false,
            error: `"${transition.label}" is not available for a ${submission.status} submission under the ${actor?.role} role.`,
          }
        }

        const entry = buildActivityFor(name, {
          actor: actor.name,
          role: actor.role,
          reason,
          timestamp: today(),
        })

        set((s) => ({
          submissions: s.submissions.map((sub) => {
            if (sub.id !== submissionId) return sub

            const next = {
              ...sub,
              status: transition.to,
              lastActivity: today(),
              activity: [...sub.activity, { ...entry, id: nextId('a'), submissionId }],
            }

            if (transition.to === S.PUBLISHED) {
              next.directPublication = Boolean(transition.direct)
              if (transition.direct) next.directPublicationReason = reason
              if (issueId) {
                next.issueId = issueId
                next.publishedDate = publicationDate || today()
                const issue = s.issues.find((i) => i.id === issueId)
                if (issue) {
                  next.volume = issue.volume
                  next.issueNumber = issue.number
                }
              }
            }

            return next
          }),
          // Publishing adds the article to the chosen issue's table of contents.
          issues: issueId
            ? s.issues.map((i) =>
                i.id === issueId && !i.articleIds.includes(submissionId)
                  ? { ...i, articleIds: [...i.articleIds, submissionId] }
                  : i,
              )
            : s.issues,
        }))

        return { ok: true, submission }
      },

      // ── Reviews ──────────────────────────────────────────────────────
      inviteReviewer: (submissionId, reviewerId, deadline, actor) =>
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id !== submissionId) return s
            if (s.reviews.some((r) => r.reviewerId === reviewerId)) return s
            const reviewer = state.users.find((u) => u.id === reviewerId)
            return {
              ...s,
              lastActivity: today(),
              reviews: [
                ...s.reviews,
                {
                  id: nextId('r'),
                  submissionId,
                  reviewerId,
                  status: 'INVITED',
                  invited: today(),
                  deadline,
                  round: 1,
                  isBlind: true,
                },
              ],
              activity: [
                ...s.activity,
                {
                  id: nextId('a'),
                  submissionId,
                  type: 'REVIEWER_INVITED',
                  label: `Invited ${reviewer?.name ?? 'a reviewer'} to review.`,
                  actor: actor.name,
                  actorRole: actor.role,
                  timestamp: today(),
                },
              ],
            }
          }),
        })),

      respondToInvitation: (submissionId, reviewId, accept, actor) =>
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id !== submissionId) return s
            return {
              ...s,
              lastActivity: today(),
              reviews: s.reviews.map((r) =>
                r.id === reviewId
                  ? { ...r, status: accept ? 'ACCEPTED' : 'DECLINED', responded: today() }
                  : r,
              ),
              activity: [
                ...s.activity,
                {
                  id: nextId('a'),
                  submissionId,
                  type: accept ? 'REVIEWER_ACCEPTED' : 'REVIEWER_DECLINED',
                  label: accept
                    ? `${actor.name} accepted the review invitation.`
                    : `${actor.name} declined the review invitation.`,
                  actor: actor.name,
                  actorRole: actor.role,
                  timestamp: today(),
                },
              ],
            }
          }),
        })),

      submitReview: (submissionId, reviewId, { summary, commentsToAuthor, recommendation }, actor) =>
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id !== submissionId) return s
            return {
              ...s,
              lastActivity: today(),
              reviews: s.reviews.map((r) =>
                r.id === reviewId
                  ? { ...r, status: 'SUBMITTED', submitted: today(), summary, commentsToAuthor, recommendation }
                  : r,
              ),
              activity: [
                ...s.activity,
                {
                  id: nextId('a'),
                  submissionId,
                  type: 'REVIEW_SUBMITTED',
                  label: `Review submitted by ${actor.name} — recommendation: ${recommendation}.`,
                  actor: actor.name,
                  actorRole: actor.role,
                  timestamp: today(),
                },
              ],
            }
          }),
        })),

      // ── Issues ───────────────────────────────────────────────────────
      addIssue: (issue) =>
        set((state) => ({
          issues: [
            ...state.issues,
            { id: nextId('iss'), articleIds: [], status: 'draft', ...issue },
          ],
        })),

      updateIssue: (issueId, patch) =>
        set((state) => ({
          issues: state.issues.map((i) => (i.id === issueId ? { ...i, ...patch } : i)),
        })),

      addArticleToIssue: (issueId, submissionId) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId && !i.articleIds.includes(submissionId)
              ? { ...i, articleIds: [...i.articleIds, submissionId] }
              : i,
          ),
        })),

      removeArticleFromIssue: (issueId, submissionId) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId
              ? { ...i, articleIds: i.articleIds.filter((id) => id !== submissionId) }
              : i,
          ),
        })),

      reorderIssueArticles: (issueId, orderedIds) =>
        set((state) => ({
          issues: state.issues.map((i) => (i.id === issueId ? { ...i, articleIds: orderedIds } : i)),
        })),

      // ── Users ────────────────────────────────────────────────────────
      updateUser: (userId, patch) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
        })),

      // ── Settings ──────────────────────────────────────────────────────
      updateSettings: (section, patch) =>
        set((state) => ({
          settings: { ...state.settings, [section]: { ...state.settings[section], ...patch } },
        })),

      // ── Prototype helpers ────────────────────────────────────────────
      resetData: () =>
        set(() => ({
          submissions: freshSubmissions(),
          issues: freshIssues(),
          users: JSON.parse(JSON.stringify(users)),
          settings: JSON.parse(JSON.stringify(defaultSettings)),
          activeRole: 'EDITOR',
        })),
    }),
    {
      name: 'jassd-prototype',
      version: 1,
      partialize: (s) => ({
        submissions: s.submissions,
        issues: s.issues,
        users: s.users,
        settings: s.settings,
        activeRole: s.activeRole,
      }),
    },
  ),
)

export default useJournalStore
