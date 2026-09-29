/**
 * Reviewer-facing view of assigned reviews.
 * Allows accepting/declining invitations and submitting a review report.
 * @module pages/MyReviews
 */

import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { reviewerCounts } from '../store/selectors'
import { formatDate, relativeTime } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState, Tabs, Note } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'

const RECOMMENDATIONS = [
  { value: 'accept', label: 'Accept without revisions' },
  { value: 'minor-revisions', label: 'Minor revisions required' },
  { value: 'major-revisions', label: 'Major revisions required' },
  { value: 'reject', label: 'Reject' },
]

export default function MyReviews() {
  const { user, pushToast } = useOutletContext()
  const submissions = useJournalStore((s) => s.submissions)
  const respondToInvitation = useJournalStore((s) => s.respondToInvitation)
  const submitReview = useJournalStore((s) => s.submitReview)

  const [tab, setTab] = useState('outstanding')
  const [writing, setWriting] = useState(null)
  const [summary, setSummary] = useState('')
  const [comments, setComments] = useState('')
  const [confidential, setConfidential] = useState('')
  const [recommendation, setRecommendation] = useState('minor-revisions')
  const [touched, setTouched] = useState(false)

  const reviews = useMemo(
    () =>
      submissions.flatMap((s) =>
        s.reviews.filter((r) => r.reviewerId === user.id).map((r) => ({ ...r, sub: s })),
      ),
    [submissions, user.id],
  )

  const counts = reviewerCounts(submissions, user.id)
  const outstanding = reviews.filter((r) => ['INVITED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status))
  const completed = reviews.filter((r) => r.status === 'SUBMITTED')
  const declined = reviews.filter((r) => r.status === 'DECLINED')

  const respond = (review, accept) => {
    respondToInvitation(review.submissionId, review.id, accept, user)
    pushToast({
      tone: accept ? 'success' : 'info',
      title: accept ? 'Invitation accepted' : 'Invitation declined',
      message: accept
        ? 'The handling editor has been notified. Please submit your review by the deadline.'
        : 'The editor has been notified and may invite another reviewer.',
    })
  }

  const valid = summary.trim().length > 0 && comments.trim().length > 0

  const submit = () => {
    setTouched(true)
    if (!valid) return
    submitReview(
      writing.submissionId,
      writing.id,
      { summary: summary.trim(), commentsToAuthor: comments.trim(), recommendation },
      user,
    )
    setWriting(null)
    setSummary('')
    setComments('')
    setConfidential('')
    setTouched(false)
    pushToast({
      tone: 'success',
      title: 'Review submitted',
      message: 'Thank you — the handling editor can now see your report.',
    })
  }

  const ReviewCard = ({ r }) => {
    const overdue = r.deadline && r.deadline < '2026-09-29' && r.status !== 'SUBMITTED'
    return (
      <li className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[0.6875rem] text-ink-400">{r.submissionId}</span>
              <StatusBadge status={r.sub.status} size="sm" />
            </div>
            <Link
              to={`/submissions/${r.submissionId}`}
              className="mt-1.5 block text-sm font-medium text-ink-900 hover:text-brand-600"
            >
              {r.sub.title}
            </Link>
            <p className="mt-1 text-[0.8125rem] text-ink-500">
              {r.sub.authors.map((a) => a.name).join(', ')} · {r.sub.articleType}
            </p>
            <p className="mt-2 text-xs text-ink-500">
              Invited {formatDate(r.invited)}
              {r.deadline && ` · Due ${formatDate(r.deadline)}`}
              {r.submitted && ` · Submitted ${formatDate(r.submitted)}`}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {r.status === 'INVITED' && (
              <>
                <button onClick={() => respond(r, true)} className="btn-primary btn-sm">
                  <Icon name="check" size={13} />
                  Accept
                </button>
                <button onClick={() => respond(r, false)} className="btn-secondary btn-sm">
                  Decline
                </button>
              </>
            )}
            {(r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && (
              <button
                onClick={() => {
                  setWriting(r)
                  setSummary(r.summary ?? '')
                  setComments(r.commentsToAuthor ?? '')
                  setRecommendation(r.recommendation ?? 'minor-revisions')
                }}
                className="btn-primary btn-sm"
              >
                <Icon name="edit" size={13} />
                {r.status === 'IN_PROGRESS' ? 'Continue review' : 'Write review'}
              </button>
            )}
            {overdue && r.status !== 'SUBMITTED' && <span className="chip bg-rose-50 text-rose-700 ring-rose-200">Overdue</span>}
          </div>
        </div>

        {r.status === 'SUBMITTED' && (
          <div className="mt-4 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
            <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Your recommendation</p>
            <p className="mt-1 text-[0.8125rem] font-medium text-ink-800">
              {RECOMMENDATIONS.find((x) => x.value === r.recommendation)?.label ?? r.recommendation}
            </p>
          </div>
        )}
      </li>
    )
  }

  return (
    <Page>
      <PageHeader
        title="My reviews"
        description="Manuscripts you have been invited to review, and reports you have submitted."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Invitations" value={counts.pending} tone={counts.pending ? 'warn' : 'default'} hint="Awaiting response" />
        <StatTile label="In progress" value={counts.active} tone={counts.active ? 'brand' : 'default'} hint="Underway" />
        <StatTile label="Submitted" value={counts.completed} tone="good" hint="Completed reports" />
        <StatTile label="Declined" value={counts.declined} hint="Declined invitations" />
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            { key: 'outstanding', label: 'Outstanding', count: outstanding.length },
            { key: 'completed', label: 'Completed', count: completed.length },
            { key: 'declined', label: 'Declined', count: declined.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5 space-y-5">
        {tab === 'outstanding' && (
          <>
            {outstanding.length === 0 ? (
              <Panel bodyClassName="p-0">
                <EmptyState
                  icon="checkCircle"
                  title="No outstanding reviews"
                  description="You have responded to every invitation. New assignments will appear here."
                />
              </Panel>
            ) : (
              <Panel title="Awaiting your review" bodyClassName="p-0">
                <ul className="divide-y divide-ink-100">
                  {outstanding.map((r) => (
                    <ReviewCard key={r.id} r={r} />
                  ))}
                </ul>
              </Panel>
            )}
            <Note tone="info" icon="lock">
              Reviews are conducted under a double-anonymous model. Author and reviewer identities are withheld from each
              other until a decision has been made.
            </Note>
          </>
        )}

        {tab === 'completed' && (
          <Panel title="Completed reviews" bodyClassName="p-0">
            {completed.length === 0 ? (
              <EmptyState icon="clipboard" title="No submitted reviews yet" />
            ) : (
              <ul className="divide-y divide-ink-100">
                {completed.map((r) => (
                  <ReviewCard key={r.id} r={r} />
                ))}
              </ul>
            )}
          </Panel>
        )}

        {tab === 'declined' && (
          <Panel title="Declined invitations" bodyClassName="p-0">
            {declined.length === 0 ? (
              <EmptyState icon="checkCircle" title="No declined invitations" />
            ) : (
              <ul className="divide-y divide-ink-100">
                {declined.map((r) => (
                  <li key={r.id} className="p-5">
                    <p className="font-mono text-[0.6875rem] text-ink-400">{r.submissionId}</p>
                    <p className="mt-1 text-sm font-medium text-ink-900">{r.sub.title}</p>
                    <p className="mt-1 text-xs text-ink-500">Declined {relativeTime(r.responded)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>

      {/* Review writing dialog */}
      <Modal
        open={Boolean(writing)}
        onClose={() => setWriting(null)}
        size="lg"
        title="Submit your review"
        description={writing ? writing.sub.title : ''}
        footer={
          <>
            <button onClick={() => setWriting(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={submit} className="btn-primary">
              <Icon name="send" size={15} />
              Submit review
            </button>
          </>
        }
      >
        {writing && (
          <div className="space-y-4">
            <div className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-3">
              <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Abstract</p>
              <p className="mt-1.5 line-clamp-4 text-[0.8125rem] leading-relaxed text-ink-700">{writing.sub.abstract}</p>
            </div>

            <div>
              <label className="label" htmlFor="rec">
                Recommendation
              </label>
              <select id="rec" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="select">
                {RECOMMENDATIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="rv-summary">
                Summary for the editor <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="rv-summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Briefly assess the contribution, rigour and suitability for the journal…"
                className={`textarea ${touched && !summary.trim() ? 'border-rose-400' : ''}`}
              />
              {touched && !summary.trim() && <p className="error-text">A summary is required.</p>}
            </div>

            <div>
              <label className="label" htmlFor="rv-comments">
                Comments to the author <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="rv-comments"
                rows={7}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Detailed, constructive comments. Separate paragraphs with a blank line…"
                className={`textarea ${touched && !comments.trim() ? 'border-rose-400' : ''}`}
              />
              {touched && !comments.trim() && <p className="error-text">Comments to the author are required.</p>}
              <p className="hint">These comments are shared with the authors and, depending on the review model, with the other reviewers.</p>
            </div>

            <div>
              <label className="label" htmlFor="rv-conf">
                Confidential comments to the editor{' '}
                <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <textarea
                id="rv-conf"
                rows={2}
                value={confidential}
                onChange={(e) => setConfidential(e.target.value)}
                placeholder="Not shared with the authors…"
                className="textarea"
              />
            </div>
          </div>
        )}
      </Modal>
    </Page>
  )
}
