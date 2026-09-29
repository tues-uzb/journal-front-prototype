/**
 * Mock issues. `articleIds` order defines the table of contents.
 * @module data/issues
 */

import { SUBMISSION_STATUS as S } from '../domain/status'

/** @typedef {import('../domain/types').Issue} Issue */

/** @type {Issue[]} */
export const issues = [
  {
    id: 'iss-12-1',
    volume: '12',
    number: '1',
    year: '2026',
    title: 'Agricultural Systems and Food Security',
    description:
      'Volume 12, Issue 1 brings together research on soil management, crop productivity and food systems resilience, including a major meta-analysis of conservation agriculture trials.',
    publicationDate: '2026-04-15',
    status: 'published',
    editorId: 'u-ed-2',
    articleIds: ['JASSD-2026-0105'],
    coverNote:
      'Includes the meta-analysis of conservation agriculture trials that was shortlisted for the society research prize.',
  },
  {
    id: 'iss-12-2',
    volume: '12',
    number: '2',
    year: '2026',
    title: 'Regional Development and Governance',
    description:
      'Volume 12, Issue 2 examines energy transitions, participatory urban governance and the institutional determinants of regional economic resilience.',
    publicationDate: '2026-06-30',
    status: 'published',
    editorId: 'u-ed-1',
    articleIds: ['JASSD-2026-0118', 'JASSD-2026-0112'],
  },
  {
    id: 'iss-12-3',
    volume: '12',
    number: '3',
    year: '2026',
    title: 'Digital Systems and Applied Methods',
    description:
      'Volume 12, Issue 3 covers machine learning applications, digital transformation in higher education and the infrastructure of open science.',
    publicationDate: '2026-09-18',
    status: 'published',
    editorId: 'u-ed-3',
    articleIds: ['JASSD-2026-0141', 'JASSD-2026-0143', 'JASSD-2026-0144'],
  },
  {
    id: 'iss-12-4',
    volume: '12',
    number: '4',
    year: '2026',
    title: 'Special Issue: Biomedical Applications of Machine Learning',
    description:
      'A forthcoming special issue on the translation of machine learning methods into clinical biomedical practice. Scheduled for December 2026.',
    status: 'scheduled',
    publicationDate: '2026-12-15',
    editorId: 'u-ed-3',
    articleIds: ['JASSD-2026-0131', 'JASSD-2026-0126'],
  },
  {
    id: 'iss-12-5',
    volume: '12',
    number: '5',
    year: '2026',
    title: 'Water Resources and Environmental Systems',
    description:
      'A forthcoming issue on freshwater availability, irrigation efficiency and environmental systems. Scheduled for March 2027.',
    status: 'scheduled',
    publicationDate: '2027-03-15',
    editorId: 'u-ed-6',
    articleIds: ['JASSD-2026-0140'],
  },
  {
    id: 'iss-13-1',
    volume: '13',
    number: '1',
    year: '2027',
    title: 'General Issue',
    description: 'Planned general issue for Volume 13. Not yet open for submissions.',
    status: 'draft',
    editorId: null,
    articleIds: [],
  },
]

/** Issues that can accept a new article (not yet published or archived). */
export const openIssues = issues.filter((i) => i.status !== 'published')

/** Published issues ordered newest first. */
export const publishedIssues = issues
  .filter((i) => i.status === 'published')
  .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1))

export const getIssue = (id) => issues.find((i) => i.id === id)

/** Human label, e.g. "Volume 12, Issue 3". */
export const issueLabel = (issue) => (issue ? `Volume ${issue.volume}, Issue ${issue.number}` : '—')

/** Full label with date, e.g. "Volume 12, Issue 3 — September 2026". */
export function issueFullLabel(issue) {
  if (!issue) return '—'
  const d = issue.publicationDate ? new Date(issue.publicationDate) : null
  const month = d
    ? d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : `${issue.year}`
  return `Volume ${issue.volume}, Issue ${issue.number} — ${month}`
}

/**
 * Seed the published article records onto submissions so the publications
 * page has volume/issue/page metadata. Called once at module load.
 *
 * @param {Array<import('../domain/types').Submission>} allSubmissions
 */
export function hydratePublishedMetadata(allSubmissions) {
  for (const issue of issues) {
    for (const articleId of issue.articleIds) {
      const s = allSubmissions.find((x) => x.id === articleId)
      if (!s) continue
      s.issueId = issue.id
      s.volume = issue.volume
      s.issueNumber = issue.number
      if (!s.publishedDate && issue.publicationDate) s.publishedDate = issue.publicationDate
      if (s.status !== S.PUBLISHED) continue
    }
  }
}
