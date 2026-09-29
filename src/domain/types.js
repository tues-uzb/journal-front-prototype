/**
 * Domain model definitions (JSDoc typedefs).
 *
 * These describe the shape of the major domain objects so the prototype is
 * organised as if it could later become a real application. At runtime the
 * data is plain JavaScript objects supplied by the mock data layer.
 *
 * @module domain/types
 */

/**
 * @typedef {'AUTHOR'|'REVIEWER'|'EDITOR'|'ADMIN'} Role
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {Role} role
 * @property {string} [affiliation]
 * @property {string} [country]
 * @property {'active'|'inactive'|'invited'} status
 * @property {string} [lastActive] ISO date
 * @property {string} [joined] ISO date
 * @property {string[]} [expertise]
 * @property {string} [orcid]
 * @property {number} [reviewsCompleted]
 * @property {number} [reviewsActive]
 * @property {string} [avatarSeed]
 */

/**
 * @typedef {Object} Author
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} affiliation
 * @property {string} [country]
 * @property {number} order
 * @property {boolean} [isCorresponding]
 * @property {string} [orcid]
 */

/**
 * @typedef {Object} SubmissionFile
 * @property {string} id
 * @property {string} name
 * @property {string} type  e.g. "Manuscript", "Figures", "Cover Letter", "Supplementary"
 * @property {'PDF'|'DOCX'|'ZIP'|'XLSX'} format
 * @property {number} version
 * @property {string} uploaded ISO date
 * @property {string} uploadedBy
 * @property {number} sizeKb
 * @property {string} [note]
 */

/**
 * @typedef {'INVITED'|'ACCEPTED'|'IN_PROGRESS'|'SUBMITTED'|'DECLINED'|'OVERDUE'} ReviewStatus
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} submissionId
 * @property {string} reviewerId
 * @property {ReviewStatus} status
 * @property {string} invited ISO date
 * @property {string} [responded] ISO date
 * @property {string} [deadline] ISO date
 * @property {string} [submitted] ISO date
 * @property {'accept'|'minor-revisions'|'major-revisions'|'reject'|'pending'} [recommendation]
 * @property {string} [summary]
 * @property {string} [commentsToAuthor]
 * @property {string} [commentsToEditor]
 * @property {number} [round]
 * @property {boolean} [isBlind]
 */

/**
 * @typedef {'DRAFT'|'SUBMITTED'|'UNDER_REVIEW'|'REVISION_REQUIRED'|'ACCEPTED'|'REJECTED'|'IN_PRODUCTION'|'PUBLISHED'} SubmissionStatus
 */

/**
 * @typedef {Object} Submission
 * @property {string} id           e.g. "JAS-2026-0142"
 * @property {string} title
 * @property {string} abstract
 * @property {string[]} keywords
 * @property {SubmissionStatus} status
 * @property {'Research Article'|'Review Article'|'Case Study'|'Short Communication'} articleType
 * @property {Author[]} authors
 * @property {string} submitted ISO date
 * @property {string} [lastActivity] ISO date
 * @property {string} [assignedEditorId]
 * @property {string} section
 * @property {string} [doi]
 * @property {string} [issueId]
 * @property {string} [publishedDate]
 * @property {string} [volume]
 * @property {string} [issueNumber]
 * @property {string} [pages]
 * @property {Review[]} reviews
 * @property {SubmissionFile[]} files
 * @property {ActivityLog[]} activity
 * @property {boolean} [directPublication]
 * @property {string} [directPublicationReason]
 */

/**
 * @typedef {Object} ActivityLog
 * @property {string} id
 * @property {string} submissionId
 * @property {string} type         machine-readable event key, e.g. "DIRECT_PUBLICATION"
 * @property {string} label        human readable description
 * @property {string} actor        display name
 * @property {Role} actorRole
 * @property {string} timestamp ISO date
 * @property {string} [reason]
 * @property {string} [note]
 */

/**
 * @typedef {Object} Issue
 * @property {string} id
 * @property {string} volume
 * @property {string} number
 * @property {string} year
 * @property {string} title
 * @property {string} [description]
 * @property {string} [publicationDate]
 * @property {'draft'|'scheduled'|'published'} status
 * @property {string[]} articleIds   ordered; order defines the table of contents
 * @property {string} [editorId]
 */

/**
 * @typedef {Object} Journal
 * @property {string} id
 * @property {string} name
 * @property {string} abbreviation
 * @property {string} description
 * @property {string} issnPrint
 * @property {string} issnOnline
 * @property {string} website
 * @property {string} publisher
 * @property {string} country
 * @property {string} [doiPrefix]
 * @property {string} [email]
 */

/**
 * @typedef {Object} JournalSettings
 * @property {Object} general
 * @property {Object} editorial
 * @property {Object} publication
 * @property {Object} appearance
 */

export {}
