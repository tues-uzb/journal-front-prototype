/**
 * Journal definition and default settings.
 * @module data/journal
 */

/** @typedef {import('../domain/types').Journal} Journal */
/** @typedef {import('../domain/types').JournalSettings} JournalSettings */

/** @type {Journal} */
export const journal = {
  id: 'jnl-1',
  name: 'Journal of Applied Sciences and Sustainable Development',
  abbreviation: 'JASSD',
  description:
    'A peer-reviewed open access journal publishing original research, review articles and case studies across applied sciences, sustainable development, environmental systems and digital technology. All articles are published under a Creative Commons Attribution 4.0 International licence.',
  issnPrint: '2049-7658',
  issnOnline: '2049-7666',
  website: 'https://jassd.example.org',
  publisher: 'Northbridge Academic Press',
  country: 'United Kingdom',
  doiPrefix: '10.48291',
  email: 'editorial@jassd.example.org',
}

/** @type {JournalSettings} */
export const defaultSettings = {
  general: {
    name: journal.name,
    abbreviation: journal.abbreviation,
    description: journal.description,
    issnPrint: journal.issnPrint,
    issnOnline: journal.issnOnline,
    website: journal.website,
    publisher: journal.publisher,
    country: journal.country,
    email: journal.email,
    language: 'English',
    timezone: 'Europe/London (GMT+1)',
  },
  editorial: {
    reviewModel: 'Double-anonymous',
    defaultReviewDeadline: '21 days',
    reminderInterval: '7 days',
    maxReviewersPerSubmission: '4',
    minReviewersRequired: '2',
    decisionThreshold: 'Majority of submitted reviews',
    allowAuthorOptOut: 'No',
  },
  publication: {
    volumeStart: '12',
    issueFrequency: 'Quarterly',
    issuesPerVolume: '4',
    doiPrefix: journal.doiPrefix,
    articleIdentifiers: 'DOI, ORCID (author-supplied)',
    licence: 'CC BY 4.0',
    embargoPeriod: 'None — immediate open access',
    acceptedFiles: 'Manuscript (PDF/DOCX), Figures (ZIP/TIFF), Supplementary data',
  },
  appearance: {
    primaryColor: '#2f4b7c',
    accentColor: '#4f6bed',
    logoText: 'JASSD',
    mastheadStyle: 'Traditional serif',
    landingPageHeadline: 'Open access research for applied science and sustainable development',
    showMetrics: 'Yes',
  },
}

/** Reviewer invitation templates shown in the invitation dialog. */
export const reviewInvitationTemplate = {
  subject: 'Invitation to review: {title}',
  body:
    'Dear {reviewerName},\n\nYou have been invited to review the manuscript "{title}" submitted to {journalName}. The abstract is included below for your reference.\n\nPlease accept or decline this invitation within 14 days. If you accept, you will be asked to submit a review by {deadline}.\n\nAbstract:\n{abstract}',
}
