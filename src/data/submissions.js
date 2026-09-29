/**
 * Mock submissions, including reviews, files and audit activity.
 *
 * The dataset deliberately covers every status and both publication paths so
 * the prototype can demonstrate the whole lifecycle from the first screen:
 * a brand new submission, one mid peer review, one awaiting revision, one in
 * production, several published, and one already published via the
 * administrative direct-publication route.
 *
 * @module data/submissions
 */

import { SUBMISSION_STATUS as S } from '../domain/status'
import { ACTIVITY } from '../domain/workflow'

/** @typedef {import('../domain/types').Submission} Submission */

let seq = 0
const uid = (prefix) => `${prefix}-${(seq += 1)}`

const author = (id, name, email, affiliation, order, isCorresponding = false, country = '') => ({
  id,
  name,
  email,
  affiliation,
  country,
  order,
  isCorresponding,
})

const file = (name, type, format, version, uploaded, uploadedBy, sizeKb, note) => ({
  id: uid('f'),
  name,
  type,
  format,
  version,
  uploaded,
  uploadedBy,
  sizeKb,
  note,
})

const activity = (type, label, actor, actorRole, timestamp, reason) => ({
  id: uid('a'),
  submissionId: '',
  type,
  label,
  actor,
  actorRole,
  timestamp,
  reason,
})

const review = (o) => ({
  id: uid('r'),
  isBlind: true,
  round: 1,
  ...o,
})

/**
 * @type {Submission[]}
 */
export const submissions = [
  // ══ 1. Brand new submission awaiting an editorial decision ═══════════
  {
    id: 'JASSD-2026-0147',
    title: 'Machine Learning Approaches for Sustainable Agriculture in Semi-Arid Regions',
    abstract:
      'Semi-arid agricultural systems face intensifying pressure from climate variability, water scarcity and declining soil fertility. This study evaluates three machine learning approaches — gradient boosted trees, convolutional neural networks and Gaussian process regression — for predicting maize yield across 14 seasons of observational data collected from six research stations in the North West Province of South Africa. Models were trained on a combination of remote sensing indices, soil moisture telemetry and historical yield records. Gradient boosted trees achieved the lowest cross-validated RMSE of 0.41 t/ha, outperforming the deep learning baseline by 18%. The study concludes that lightweight ensemble models offer a more practical pathway to scalable yield forecasting than computationally intensive architectures, particularly where data infrastructure is limited.',
    keywords: ['Machine Learning', 'Sustainable Agriculture', 'Crop Yield Prediction', 'Remote Sensing', 'Climate Resilience'],
    status: S.SUBMITTED,
    articleType: 'Research Article',
    section: 'Agricultural Systems',
    submitted: '2026-09-24',
    lastActivity: '2026-09-24',
    assignedEditorId: 'u-ed-2',
    authors: [
      author('a-1', 'Dr. Amara Nwosu', 'a.nwosu@uct.ac.za', 'University of Cape Town', 1, true, 'South Africa'),
      author('a-2', 'Dr. Thabo Dlamini', 't.dlamini@ukzn.ac.za', 'University of KwaZulu-Natal', 2, false, 'South Africa'),
      author('a-3', 'Prof. Willem Fourie', 'w.fourie@nwu.ac.za', 'North-West University', 3, false, 'South Africa'),
    ],
    reviews: [],
    files: [
      file('Manuscript_JASSD-2026-0147.pdf', 'Manuscript', 'PDF', 1, '2026-09-24', 'Dr. Amara Nwosu', 2840, 'Anonymised main text'),
      file('Figures_1-6.zip', 'Figures', 'ZIP', 1, '2026-09-24', 'Dr. Amara Nwosu', 18400, 'Six figures at 300 dpi'),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-09-24', 'Dr. Amara Nwosu', 210),
      file('Supplementary_Dataset.xlsx', 'Supplementary', 'XLSX', 1, '2026-09-24', 'Dr. Thabo Dlamini', 5240),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Amara Nwosu', 'AUTHOR', '2026-09-24'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Rajesh Anand as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-09-25'),
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Submission passed initial scope and ethics screening.', 'Dr. Rajesh Anand', 'EDITOR', '2026-09-26'),
    ],
  },

  // ══ 2. Under review — one reviewer still deciding ═════════════════════
  {
    id: 'JASSD-2026-0143',
    title: 'Climate Variability and Crop Productivity: A Longitudinal Analysis of Yield Stability in Southern Africa',
    abstract:
      'Interannual climate variability is a dominant driver of cereal yield instability across much of southern Africa, yet the contribution of individual climate variables to yield anomalies remains poorly quantified. Using a panel of 1.2 million hectare-level yield observations spanning 1986–2024, we decompose yield variance into temperature, precipitation and extreme-weather components. Results show that the coefficient of variation of yields increased by 31% over the study period, driven predominantly by late-season heat stress rather than aggregate rainfall deficits. We further demonstrate that farms with access to supplementary irrigation experienced a 2.4-fold reduction in yield variance, suggesting that targeted water infrastructure may be a more effective resilience investment than cultivar switching alone.',
    keywords: ['Climate Variability', 'Crop Productivity', 'Yield Stability', 'Adaptation', 'Southern Africa'],
    status: S.UNDER_REVIEW,
    articleType: 'Research Article',
    section: 'Environmental Systems',
    submitted: '2026-08-19',
    lastActivity: '2026-09-27',
    assignedEditorId: 'u-ed-1',
    authors: [
      author('a-4', 'Dr. Kwabena Boateng', 'k.boateng@wits.ac.za', 'University of the Witwatersrand', 1, true, 'South Africa'),
      author('a-5', 'Dr. Nomsa Dube', 'n.dube@unizul.ac.za', 'University of Zululand', 2, false, 'South Africa'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-1',
        status: 'SUBMITTED',
        invited: '2026-08-26',
        responded: '2026-08-27',
        deadline: '2026-09-16',
        submitted: '2026-09-14',
        recommendation: 'minor-revisions',
        summary:
          'A well-executed study with a large and credible dataset. The variance decomposition methodology is sound and clearly described. My main reservations concern the treatment of spatial autocorrelation in the panel model and the absence of sensitivity analysis for the irrigation instrument.',
        commentsToAuthor:
          'The authors should address the following before I can recommend acceptance.\n\n1. Spatial dependence: The panel fixed-effects specification does not appear to account for spatial autocorrelation within agro-ecological zones. Standard errors are likely biased downward, which would make the irrigation effect appear larger than it is. Please add a spatially clustered bootstrap or a Driscoll-Kraay correction.\n\n2. Irrigation instrument: The discussion attributes the yield-stability benefit to supplementary irrigation, but the selection criteria for the treated sample are not described. If irrigation access is correlated with farm size or soil quality, the 2.4-fold estimate may partly reflect that correlation. A short paragraph acknowledging this limitation would strengthen the paper considerably.\n\n3. Presentation: Figure 3 is difficult to read at single-column width. Consider splitting it into panels.\n\n4. The 1986–1994 period contains two severe drought years that dominate the variance estimates. The authors may wish to report results excluding these years as a robustness check.\n\nOverall this is a valuable contribution and I recommend minor revisions.',
        commentsToEditor:
          'Solid paper, well suited to the journal. I would be comfortable publishing after the spatial autocorrelation issue is addressed. The authors have been responsive in the past.',
      }),
      review({
        reviewerId: 'u-rv-6',
        status: 'IN_PROGRESS',
        invited: '2026-08-26',
        responded: '2026-08-29',
        deadline: '2026-09-30',
      }),
      review({
        reviewerId: 'u-rv-2',
        status: 'ACCEPTED',
        invited: '2026-08-26',
        responded: '2026-08-28',
        deadline: '2026-09-16',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0143.pdf', 'Manuscript', 'PDF', 1, '2026-08-19', 'Dr. Kwabena Boateng', 3120),
      file('Figures_1-5.zip', 'Figures', 'ZIP', 1, '2026-08-19', 'Dr. Kwabena Boateng', 14200),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-08-19', 'Dr. Kwabena Boateng', 195),
      file('Panel_Data_Description.pdf', 'Supplementary', 'PDF', 1, '2026-08-19', 'Dr. Nomsa Dube', 880),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Kwabena Boateng', 'AUTHOR', '2026-08-19'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Elena Marchetti as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-08-21'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-08-25'),
      activity(ACTIVITY.REVIEWER_INVITED, 'Invited Dr. Ingrid Halvorsen, Dr. Ravi Deshmukh and Dr. Kwame Mensah to review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-08-26'),
      activity(ACTIVITY.REVIEWER_ACCEPTED, 'Dr. Ingrid Halvorsen accepted the invitation.', 'Dr. Ingrid Halvorsen', 'REVIEWER', '2026-08-27'),
      activity(ACTIVITY.REVIEWER_ACCEPTED, 'Dr. Kwame Mensah accepted the invitation.', 'Dr. Kwame Mensah', 'REVIEWER', '2026-08-28'),
      activity(ACTIVITY.REVIEWER_ACCEPTED, 'Dr. Ravi Deshmukh accepted the invitation.', 'Dr. Ravi Deshmukh', 'REVIEWER', '2026-08-29'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Ingrid Halvorsen — recommendation: minor revisions.', 'Dr. Ingrid Halvorsen', 'REVIEWER', '2026-09-14'),
      activity(ACTIVITY.REVIEW_REMINDER_SENT, 'Reminder sent to Dr. Ravi Deshmukh; review due 30 September 2026.', 'Prof. Elena Marchetti', 'EDITOR', '2026-09-27'),
    ],
  },

  // ══ 3. Revision required — author has responded ══════════════════════
  {
    id: 'JASSD-2026-0138',
    title: 'Digital Transformation in Higher Education: Institutional Responses to the Shift to Online Provision',
    abstract:
      'The acceleration of online provision in higher education has outpaced most institutional governance frameworks. This mixed-methods study examines how 24 research-intensive universities across nine countries restructured academic operations between 2020 and 2025. Survey data from 3,180 academic staff is combined with 42 semi-structured interviews with senior leaders. We find that institutions pursued three distinct strategies — capability-led, compliance-led and platform-led — with materially different effects on staff workload, perceived autonomy and student satisfaction. Platform-led institutions reported the highest initial adoption rates but also the steepest decline in staff satisfaction by year three. The study concludes that digital transformation framed purely as infrastructure procurement produces fragile outcomes, and that governance capacity is the more significant determinant of sustainable change.',
    keywords: ['Digital Transformation', 'Higher Education', 'Governance', 'Online Learning', 'Organisational Change'],
    status: S.REVISION_REQUIRED,
    articleType: 'Research Article',
    section: 'Education & Learning Sciences',
    submitted: '2026-07-28',
    lastActivity: '2026-09-11',
    assignedEditorId: 'u-ed-5',
    authors: [
      author('a-6', 'Dr. James Whitmore', 'j.whitmore@york.ac.uk', 'University of York', 1, true, 'United Kingdom'),
      author('a-7', 'Dr. Priya Raghunathan', 'p.raghunathan@ed.ac.uk', 'University of Edinburgh', 2, false, 'United Kingdom'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-5',
        status: 'SUBMITTED',
        invited: '2026-08-04',
        responded: '2026-08-05',
        deadline: '2026-08-25',
        submitted: '2026-08-21',
        recommendation: 'major-revisions',
        summary:
          'An important and timely topic, but the three-strategy typology is asserted rather than derived. The authors need to demonstrate empirically how the three categories were arrived at, and address the apparent confound between institutional funding model and chosen strategy.',
        commentsToAuthor:
          'This manuscript addresses an important question, but I am not yet convinced by the analytical framework.\n\n1. Derivation of the typology: The three strategies (capability-led, compliance-led, platform-led) are introduced without a derivation process. Were they identified inductively from the interview data, or imposed a priori? Please provide the coding procedure and a table of how each of the 24 institutions was classified, including cases that did not fit neatly.\n\n2. Confounding: Institutional funding model is almost certainly correlated with the strategy chosen — wealthy institutions can afford platform-led approaches. The year-three satisfaction decline may reflect this rather than any intrinsic weakness of the strategy. Please add a comparison that holds funding model roughly constant.\n\n3. Missing data: 214 of 3,180 survey responses were excluded for incompleteness. Is this differential across institutions? Please report a missingness analysis.\n\n4. The interview sample of 42 is described as "senior leaders", but the transcripts suggest a broader range of roles were included. Please clarify the sampling frame.\n\nI would welcome a revised version addressing these points.',
        commentsToEditor:
          'Good study, weak analysis at present. The typology needs proper derivation before the paper can stand. I would not be opposed to a revised submission.',
      }),
      review({
        reviewerId: 'u-rv-2',
        status: 'SUBMITTED',
        invited: '2026-08-04',
        responded: '2026-08-06',
        deadline: '2026-08-25',
        submitted: '2026-08-19',
        recommendation: 'major-revisions',
        summary:
          'The longitudinal element is a real strength, but the authors need to separate the effect of the pandemic shock from the effect of the institutional response, which are confounded in the 2020–2022 period.',
        commentsToAuthor:
          'The three-year longitudinal design is genuinely valuable and rarer than it should be in this literature. My concern is that the 2020–2022 window conflates two distinct effects: the exogenous pandemic disruption and the endogenous institutional response. These need separating.\n\n1. Please model 2020–2022 separately from 2023–2025.\n2. The claim that governance capacity is "more significant" than infrastructure requires the institutional fixed effects to be reported directly rather than described in prose.\n3. Figure 2 needs a confidence band on the satisfaction trajectories.\n\nSubstantial revision required.',
        commentsToEditor: 'Recommend major revisions. The core dataset is valuable and worth seeing again.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0138.pdf', 'Manuscript', 'PDF', 1, '2026-07-28', 'Dr. James Whitmore', 2650, 'Original submission'),
      file('Manuscript_JASSD-2026-0138_rev1.pdf', 'Manuscript', 'PDF', 2, '2026-09-11', 'Dr. James Whitmore', 2910, 'Revised following reviewer comments'),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-07-28', 'Dr. James Whitmore', 180),
      file('Institution_Classification_Table.xlsx', 'Supplementary', 'XLSX', 2, '2026-09-11', 'Dr. Priya Raghunathan', 640),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. James Whitmore', 'AUTHOR', '2026-07-28'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Hannah Whitfield as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-07-30'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Dr. Hannah Whitfield', 'EDITOR', '2026-08-03'),
      activity(ACTIVITY.REVIEWER_INVITED, 'Invited Dr. Amelia Foster and Dr. Kwame Mensah to review.', 'Dr. Hannah Whitfield', 'EDITOR', '2026-08-04'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Amelia Foster — recommendation: major revisions.', 'Dr. Amelia Foster', 'REVIEWER', '2026-08-19'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Kwame Mensah — recommendation: major revisions.', 'Dr. Kwame Mensah', 'REVIEWER', '2026-08-21'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Revision requested from the author following two major revision recommendations.', 'Dr. Hannah Whitfield', 'EDITOR', '2026-08-24', 'Both reviewers recommend major revision. The typology derivation and the pandemic/response confound must be addressed.'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. James Whitmore', 'AUTHOR', '2026-09-11'),
    ],
  },

  // ══ 4. Accepted, awaiting production ═════════════════════════════════
  {
    id: 'JASSD-2026-0131',
    title: 'Artificial Intelligence Applications in Medical Imaging: A Systematic Review of Clinical Deployment',
    abstract:
      'Machine learning models have demonstrated strong performance in retrospective medical imaging tasks, yet evidence of prospective clinical deployment remains sparse. This systematic review searched PubMed, Embase, IEEE Xplore and the Cochrane Library for studies reporting clinical deployment of artificial intelligence systems in radiology, pathology and ophthalmology between 2018 and 2025. Of 3,847 records screened, 214 met inclusion criteria, of which only 38 (17.8%) described deployment outside a single institution. We classify deployed systems into assistive, autonomous and triage categories and assess the level of human oversight in each. The majority of assistive systems reported meaningful changes in reader performance, but only four studies incorporated prospective outcome measures. We identify regulatory lag, integration friction and dataset shift as the dominant barriers to wider adoption, and propose a reporting framework for clinical imaging AI evaluation.',
    keywords: ['Artificial Intelligence', 'Medical Imaging', 'Clinical Deployment', 'Systematic Review', 'Radiology'],
    status: S.ACCEPTED,
    articleType: 'Review Article',
    section: 'Biomedical Engineering',
    submitted: '2026-06-11',
    lastActivity: '2026-09-08',
    assignedEditorId: 'u-ed-3',
    authors: [
      author('a-8', 'Dr. Mei-Ling Chow', 'm.chow@hku.hk', 'The University of Hong Kong', 1, true, 'Hong Kong'),
      author('a-9', 'Dr. Anders Sørensen', 'a.sorensen@dtu.dk', 'Technical University of Denmark', 2, false, 'Denmark'),
      author('a-10', 'Dr. Fatima Al-Rashid', 'f.alrashid@kaust.edu.sa', 'King Abdullah University of Science and Technology', 3, false, 'Saudi Arabia'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-3',
        status: 'SUBMITTED',
        invited: '2026-06-25',
        responded: '2026-06-26',
        deadline: '2026-07-16',
        submitted: '2026-07-12',
        recommendation: 'accept',
        summary:
          'A thorough and well-designed review. The distinction between retrospective performance and prospective clinical deployment is one the field badly needs, and the proposed reporting framework is practical and likely to be adopted.',
        commentsToAuthor:
          'This is a comprehensive and carefully executed review. The central distinction the authors draw — between retrospective benchmark performance and prospective clinical deployment — is one the field has been slow to acknowledge, and I think this paper will be widely cited for making it explicit.\n\nI have only minor points.\n\n1. The PRISMA flow diagram (Figure 1) is excellent; please ensure the exclusion reasons are reported in the main text as well as the supplement.\n2. Consider adding a short subsection on federated learning approaches, which appear in several of the excluded papers as a deployment strategy.\n3. The reporting framework in Table 4 is strong. In the final version please number the criteria so they can be cited individually.\n\nI recommend acceptance without further revision.',
        commentsToEditor: 'Excellent review, recommend acceptance. No concerns.',
      }),
      review({
        reviewerId: 'u-rv-1',
        status: 'SUBMITTED',
        invited: '2026-06-25',
        responded: '2026-06-27',
        deadline: '2026-07-16',
        submitted: '2026-07-09',
        recommendation: 'accept',
        summary:
          'Comprehensive and appropriately critical. The barrier taxonomy in Section 5 is particularly useful.',
        commentsToAuthor:
          'A well-scoped and appropriately critical review. The barrier taxonomy in Section 5 (regulatory lag, integration friction, dataset shift) is the most useful part of the paper and I hope it is adopted more widely.\n\nTwo small points: the figure counting error for the 2023 multicentre study in Section 3.2 (reported as n=1,214; the abstract states n=1,408), and Figure 6 is redundant with the text of Section 5.1 and could be removed to reduce length.\n\nOtherwise I recommend acceptance.',
        commentsToEditor: 'Recommend acceptance. Well within scope and of clear interest to readers.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0131.pdf', 'Manuscript', 'PDF', 1, '2026-06-11', 'Dr. Mei-Ling Chow', 4210),
      file('Figures_1-8.zip', 'Figures', 'ZIP', 1, '2026-06-11', 'Dr. Mei-Ling Chow', 26800),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-06-11', 'Dr. Mei-Ling Chow', 205),
      file('PRISMA_Flow_Diagram.pdf', 'Supplementary', 'PDF', 1, '2026-06-11', 'Dr. Anders Sørensen', 430),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Mei-Ling Chow', 'AUTHOR', '2026-06-11'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Sofia Lindqvist as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-06-16'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Dr. Sofia Lindqvist', 'EDITOR', '2026-06-24'),
      activity(ACTIVITY.REVIEWER_INVITED, 'Invited Dr. Claire Dubois and Dr. Ingrid Halvorsen to review.', 'Dr. Sofia Lindqvist', 'EDITOR', '2026-06-25'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Ingrid Halvorsen — recommendation: accept.', 'Dr. Ingrid Halvorsen', 'REVIEWER', '2026-07-09'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Claire Dubois — recommendation: accept.', 'Dr. Claire Dubois', 'REVIEWER', '2026-07-12'),
      activity(ACTIVITY.SUBMISSION_ACCEPTED, 'Manuscript accepted following peer review. Both reviewers recommended acceptance.', 'Dr. Sofia Lindqvist', 'EDITOR', '2026-07-15', 'Acceptance confirmed. Copy-editing to begin ahead of the September issue.'),
    ],
  },

  // ══ 5. In production ══════════════════════════════════════════════════
  {
    id: 'JASSD-2026-0126',
    title: 'Urban Development and Smart City Infrastructure: Assessing the Returns of Public Investment in Sensor Networks',
    abstract:
      'Municipalities worldwide have invested substantially in urban sensor networks to support traffic management, environmental monitoring and public safety. Evidence on the returns to this investment is sparse and largely anecdotal. This study analyses 61 municipal sensor network deployments across 14 countries between 2015 and 2024, combining procurement records, budget data and municipal performance indicators. We estimate that deployments reaching a critical density threshold generated measurable reductions in emergency response times (median 14 minutes, 95% CI 8–19) and per-capital monitoring costs, while deployments below that threshold showed no detectable benefit. Governance capacity and interdepartmental data-sharing agreements emerged as stronger predictors of return than sensor specification. The findings suggest that cities should sequence network expansion after achieving integration maturity, rather than pursuing scale first.',
    keywords: ['Smart Cities', 'Urban Infrastructure', 'Public Investment', 'Sensor Networks', 'Urban Governance'],
    status: S.IN_PRODUCTION,
    articleType: 'Research Article',
    section: 'Urban & Infrastructure',
    submitted: '2026-05-04',
    lastActivity: '2026-09-22',
    assignedEditorId: 'u-ed-4',
    authors: [
      author('a-11', 'Dr. Chidinma Eze', 'c.eze@unilag.edu.ng', 'University of Lagos', 1, true, 'Nigeria'),
      author('a-12', 'Dr. Yuki Tanaka', 'y.tanaka@u-tokyo.ac.jp', 'University of Tokyo', 2, false, 'Japan'),
      author('a-13', 'Dr. Beatriz Nogueira', 'b.nogueira@usp.br', 'Universidade de São Paulo', 3, false, 'Brazil'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-7',
        status: 'SUBMITTED',
        invited: '2026-05-18',
        responded: '2026-05-20',
        deadline: '2026-06-09',
        submitted: '2026-06-03',
        recommendation: 'minor-revisions',
        summary:
          'A genuinely comparative dataset and a question of real policy importance. The threshold analysis is the strongest element and should be foregrounded.',
        commentsToAuthor:
          'This is a valuable contribution. The 61-deployment dataset is impressive and unusually well assembled.\n\n1. The critical density threshold is the paper\'s central claim. Please report the sensitivity of this threshold to the choice of bin width, and give confidence intervals around the discontinuity estimate.\n\n2. The emergency response time effect is plausibly confounded by cities that invested in sensor networks also investing in dispatch software. Please discuss this explicitly.\n\n3. Section 4.3 conflates monitoring cost reduction with cost avoidance. These are different accounting concepts and the wording should be tightened.\n\nAcceptable after minor revision.',
        commentsToEditor: 'Strong comparative work. Recommend acceptance after minor revisions.',
      }),
      review({
        reviewerId: 'u-rv-4',
        status: 'SUBMITTED',
        invited: '2026-05-18',
        responded: '2026-05-19',
        deadline: '2026-06-09',
        submitted: '2026-05-30',
        recommendation: 'accept',
        summary:
          'The governance-first finding resonates with our own work in Latin American cities. Well designed and clearly written.',
        commentsToAuthor:
          'A well-designed comparative study. I was particularly interested to see the governance capacity finding, which mirrors what we have observed in our own municipal data.\n\nMinor comments only:\n\n1. The procurement record extraction method should be described in more detail, given variation in municipal record-keeping practice.\n2. Table 2 city names should be anonymised where necessary for the security assessment.\n3. Consider adding a short paragraph on maintenance cost, which the study does not capture and which is often the dominant long-run expense.\n\nI recommend acceptance.',
        commentsToEditor: 'Recommend acceptance. Good fit for the urban infrastructure section.',
      }),
      review({
        reviewerId: 'u-rv-2',
        status: 'SUBMITTED',
        invited: '2026-05-18',
        responded: '2026-05-22',
        deadline: '2026-06-09',
        submitted: '2026-06-06',
        recommendation: 'accept',
        summary: 'Agree with the other reviewers. Sound methodology, clear conclusions.',
        commentsToAuthor:
          'I concur with the recommendations of the other reviewers. The dataset assembly is impressive and the conclusions are appropriately bounded. No substantive concerns.',
        commentsToEditor: 'Recommend acceptance.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0126.pdf', 'Manuscript', 'PDF', 1, '2026-05-04', 'Dr. Chidinma Eze', 3980),
      file('Manuscript_JASSD-2026-0126_rev1.pdf', 'Manuscript', 'PDF', 2, '2026-06-20', 'Dr. Chidinma Eze', 4120, 'Revised after minor revisions'),
      file('Figures_1-9.zip', 'Figures', 'ZIP', 2, '2026-06-20', 'Dr. Chidinma Eze', 31200),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-05-04', 'Dr. Chidinma Eze', 190),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Chidinma Eze', 'AUTHOR', '2026-05-04'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Daniel Achebe as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-05-07'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Daniel Achebe', 'EDITOR', '2026-05-15'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Tomás Herrera — recommendation: accept.', 'Dr. Tomás Herrera', 'REVIEWER', '2026-05-30'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Yuki Tanaka — recommendation: minor revisions.', 'Dr. Yuki Tanaka', 'REVIEWER', '2026-06-03'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Kwame Mensah — recommendation: accept.', 'Dr. Kwame Mensah', 'REVIEWER', '2026-06-06'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Minor revisions requested from the author.', 'Prof. Daniel Achebe', 'EDITOR', '2026-06-09', 'Threshold sensitivity analysis and cost accounting wording to be addressed.'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. Chidinma Eze', 'AUTHOR', '2026-06-20'),
      activity(ACTIVITY.SUBMISSION_ACCEPTED, 'Manuscript accepted following peer review.', 'Prof. Daniel Achebe', 'EDITOR', '2026-06-24'),
      activity(ACTIVITY.MOVED_TO_PRODUCTION, 'Article moved to production for copy-editing and typesetting.', 'Jonas Bergström', 'ADMIN', '2026-06-26'),
      activity(ACTIVITY.FILE_UPLOADED, 'Copy-edited proof uploaded (version 3).', 'Jonas Bergström', 'ADMIN', '2026-09-22'),
    ],
  },

  // ══ 6. Published — standard peer-review path ═════════════════════════
  {
    id: 'JASSD-2026-0118',
    title: 'Renewable Energy Adoption and Regional Economic Resilience: Evidence from Nordic Rural Districts',
    abstract:
      'This study examines whether renewable energy adoption is associated with improved economic resilience in rural Nordic districts between 2008 and 2023. Combining register-level energy data with district-level economic indicators for 214 municipalities across Norway, Sweden and Finland, we employ an event-study design around the opening of community-scale renewable installations. Results indicate a persistent 3.1 percentage point increase in local employment resilience following installation, with the effect concentrated in districts lacking pre-existing generation capacity. Effects are weaker in districts with high initial dependence on a single export industry, suggesting that energy diversification is complementary to rather than substitutive for economic diversification. We caution against extrapolation to regions with different institutional or grid structures.',
    keywords: ['Renewable Energy', 'Economic Resilience', 'Regional Development', 'Nordic Region', 'Energy Policy'],
    status: S.PUBLISHED,
    articleType: 'Research Article',
    section: 'Sustainable Development',
    submitted: '2026-03-12',
    lastActivity: '2026-06-30',
    assignedEditorId: 'u-ed-1',
    doi: '10.48291/jassd.2026.0118',
    issueId: 'iss-12-2',
    publishedDate: '2026-06-30',
    volume: '12',
    issueNumber: '2',
    pages: '141–168',
    authors: [
      author('a-14', 'Dr. Ingrid Halvorsen', 'i.halvorsen@ntnu.no', 'Norwegian University of Science and Technology', 1, true, 'Norway'),
      author('a-15', 'Dr. Anders Bakke', 'a.bakke@su.se', 'Stockholm University', 2, false, 'Sweden'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-6',
        status: 'SUBMITTED',
        invited: '2026-03-25',
        responded: '2026-03-26',
        deadline: '2026-04-15',
        submitted: '2026-04-09',
        recommendation: 'minor-revisions',
        summary: 'Well-executed event study with a credible identification strategy. Happy to support publication after minor correction.',
        commentsToAuthor:
          'A well-executed event study. The identification strategy is credible and the pre-trend analysis is properly reported.\n\n1. Please clarify the treatment of districts that received installations before 2012, which are excluded from the sample.\n2. Standard errors in Table 3 should be clustered at the installation level rather than municipality.\n3. The final paragraph could more explicitly acknowledge the institutional differences that limit generalisability.\n\nMinor revisions only.',
        commentsToEditor: 'Recommend acceptance after minor revisions.',
      }),
      review({
        reviewerId: 'u-rv-4',
        status: 'SUBMITTED',
        invited: '2026-03-25',
        responded: '2026-03-28',
        deadline: '2026-04-15',
        submitted: '2026-04-12',
        recommendation: 'accept',
        summary: 'Complementary to the other review. The policy discussion is measured and appropriate.',
        commentsToAuthor:
          'I concur with the assessment of the other reviewer. The complementary relationship between energy and economic diversification is a point the authors make well and that is often lost in this literature.\n\nNo substantive concerns. One suggestion: the authors might briefly mention comparable evidence from the German Lausitz region, which is a natural point of comparison.',
        commentsToEditor: 'Recommend acceptance.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0118.pdf', 'Manuscript', 'PDF', 1, '2026-03-12', 'Dr. Ingrid Halvorsen', 3540),
      file('Manuscript_JASSD-2026-0118_final.pdf', 'Manuscript', 'PDF', 3, '2026-06-02', 'Jonas Bergström', 3610, 'Version of record'),
      file('Figures_1-7.zip', 'Figures', 'ZIP', 2, '2026-04-25', 'Dr. Ingrid Halvorsen', 22100),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-03-12', 'Dr. Ingrid Halvorsen', 175),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Ingrid Halvorsen', 'AUTHOR', '2026-03-12'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Elena Marchetti as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-03-17'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-03-24'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Ravi Deshmukh — recommendation: minor revisions.', 'Dr. Ravi Deshmukh', 'REVIEWER', '2026-04-09'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Tomás Herrera — recommendation: accept.', 'Dr. Tomás Herrera', 'REVIEWER', '2026-04-12'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Minor revisions requested from the author.', 'Prof. Elena Marchetti', 'EDITOR', '2026-04-15'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. Ingrid Halvorsen', 'AUTHOR', '2026-04-25'),
      activity(ACTIVITY.SUBMISSION_ACCEPTED, 'Manuscript accepted following peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-04-29'),
      activity(ACTIVITY.MOVED_TO_PRODUCTION, 'Article moved to production.', 'Jonas Bergström', 'ADMIN', '2026-04-30'),
      activity(ACTIVITY.ARTICLE_PUBLISHED, 'Article published in Volume 12, Issue 2.', 'Jonas Bergström', 'ADMIN', '2026-06-30'),
    ],
  },

  // ══ 7. Published — standard path, different issue ════════════════════
  {
    id: 'JASSD-2026-0112',
    title: 'Participatory Governance and Urban Resilience: Comparative Evidence from Lagos, Accra and Dakar',
    abstract:
      'Rapid urbanisation across West Africa is outpacing top-down planning capacity, prompting municipalities to experiment with participatory governance arrangements. This comparative study examines three metropolitan governments — Lagos, Accra and Dakar — between 2016 and 2023, tracing how participatory structures were designed, who they included and how their decisions entered formal planning processes. Using document analysis of 412 planning resolutions and interviews with 68 officials and community representatives, we identify three governance logics: instrumental consultation, deliberative co-production and negotiated bargaining. Only the latter produced measurable improvements in service delivery to informal settlements. The paper argues that participation must be assessed by its binding effect on decisions rather than by its inclusiveness, and offers design principles for municipalities beginning participatory processes.',
    keywords: ['Participatory Governance', 'Urban Resilience', 'West Africa', 'Comparative Politics', 'Informal Settlements'],
    status: S.PUBLISHED,
    articleType: 'Research Article',
    section: 'Urban & Infrastructure',
    submitted: '2026-02-20',
    lastActivity: '2026-06-30',
    assignedEditorId: 'u-ed-4',
    doi: '10.48291/jassd.2026.0112',
    issueId: 'iss-12-2',
    publishedDate: '2026-06-30',
    volume: '12',
    issueNumber: '2',
    pages: '89–116',
    authors: [
      author('a-16', 'Dr. Olusegun Adeyemi', 'o.adeyemi@unilag.edu.ng', 'University of Lagos', 1, true, 'Nigeria'),
      author('a-17', 'Dr. Akosua Mensah', 'a.mensah@ug.edu.gh', 'University of Ghana', 2, false, 'Ghana'),
      author('a-18', 'Dr. Mariama Sow', 'm.sow@ucad.sn', 'Université Cheikh Anta Diop', 3, false, 'Senegal'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-4',
        status: 'SUBMITTED',
        invited: '2026-03-05',
        responded: '2026-03-06',
        deadline: '2026-03-26',
        submitted: '2026-03-20',
        recommendation: 'accept',
        summary: 'Excellent comparative design and a genuinely useful distinction between inclusiveness and binding effect.',
        commentsToAuthor:
          'This is a well-designed comparative study and the distinction between inclusiveness and binding effect is one that the participatory governance literature has needed.\n\n1. The document corpus of 412 resolutions is impressive — please ensure the selection criteria are reproducible in the appendix.\n2. The "negotiated bargaining" category is doing a lot of analytical work. I would welcome a paragraph on what distinguishes it in practice from clientelism, given the three cases studied.\n3. Table 5 needs row labels expanded for readers unfamiliar with the municipal structures.\n\nRecommend acceptance with these minor adjustments.',
        commentsToEditor: 'Recommend acceptance. Strong comparative piece with clear policy relevance.',
      }),
      review({
        reviewerId: 'u-rv-7',
        status: 'SUBMITTED',
        invited: '2026-03-05',
        responded: '2026-03-09',
        deadline: '2026-03-26',
        submitted: '2026-03-24',
        recommendation: 'minor-revisions',
        summary: 'Strong qualitative work. The interview protocol and translation approach need describing in more detail.',
        commentsToAuthor:
          'The comparative design is the strength of this paper and it is executed competently.\n\n1. Please describe the interview protocol and, critically, the translation and back-translation process. Working across French, English and Wolof introduces interpretive risk that should be addressed explicitly.\n2. The authors should state how many interviews were conducted in each language.\n3. The conclusion is appropriately measured.\n\nMinor revisions only.',
        commentsToEditor: 'Recommend acceptance after minor revisions.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0112.pdf', 'Manuscript', 'PDF', 1, '2026-02-20', 'Dr. Olusegun Adeyemi', 4760),
      file('Manuscript_JASSD-2026-0112_final.pdf', 'Manuscript', 'PDF', 3, '2026-06-05', 'Jonas Bergström', 4890, 'Version of record'),
      file('Figures_1-6.zip', 'Figures', 'ZIP', 2, '2026-03-28', 'Dr. Olusegun Adeyemi', 19800),
      file('Interview_Protocol.pdf', 'Supplementary', 'PDF', 1, '2026-02-20', 'Dr. Akosua Mensah', 610),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Olusegun Adeyemi', 'AUTHOR', '2026-02-20'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Daniel Achebe as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-02-24'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Daniel Achebe', 'EDITOR', '2026-03-03'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Tomás Herrera — recommendation: accept.', 'Dr. Tomás Herrera', 'REVIEWER', '2026-03-20'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Yuki Tanaka — recommendation: minor revisions.', 'Dr. Yuki Tanaka', 'REVIEWER', '2026-03-24'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Minor revisions requested from the author.', 'Prof. Daniel Achebe', 'EDITOR', '2026-03-27'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. Olusegun Adeyemi', 'AUTHOR', '2026-03-28'),
      activity(ACTIVITY.SUBMISSION_ACCEPTED, 'Manuscript accepted following peer review.', 'Prof. Daniel Achebe', 'EDITOR', '2026-04-01'),
      activity(ACTIVITY.MOVED_TO_PRODUCTION, 'Article moved to production.', 'Jonas Bergström', 'ADMIN', '2026-04-02'),
      activity(ACTIVITY.ARTICLE_PUBLISHED, 'Article published in Volume 12, Issue 2.', 'Jonas Bergström', 'ADMIN', '2026-06-30'),
    ],
  },

  // ══ 8. Published — standard path, another issue ══════════════════════
  {
    id: 'JASSD-2026-0105',
    title: 'Soil Carbon Sequestration Under Conservation Agriculture: A Meta-Analysis of Field Trials',
    abstract:
      'Conservation agriculture — minimal soil disturbance, permanent soil cover and crop rotation — is widely promoted as a strategy for soil carbon sequestration, but the evidence base is heterogeneous. This meta-analysis synthesises 214 field trials published between 2005 and 2025, estimating mean changes in soil organic carbon under conservation versus conventional management. Overall, conservation agriculture increased topsoil organic carbon by 0.32 percentage points over a mean observation period of 8.4 years, corresponding to approximately 8.9 t C/ha. Effects were significantly larger under arid conditions (mean 14.2 t C/ha) and where the observation period exceeded ten years, and were substantially smaller where residue cover was below 30%. The results support conservation agriculture as a meaningful but conditional sequestration strategy, and indicate that residue cover thresholds are a more useful intervention target than tillage reduction alone.',
    keywords: ['Soil Carbon', 'Conservation Agriculture', 'Meta-Analysis', 'Carbon Sequestration', 'Agronomy'],
    status: S.PUBLISHED,
    articleType: 'Review Article',
    section: 'Agricultural Systems',
    submitted: '2026-01-15',
    lastActivity: '2026-04-15',
    assignedEditorId: 'u-ed-2',
    doi: '10.48291/jassd.2026.0105',
    issueId: 'iss-12-1',
    publishedDate: '2026-04-15',
    volume: '12',
    issueNumber: '1',
    pages: '52–83',
    authors: [
      author('a-19', 'Dr. Ravi Deshmukh', 'r.deshmukh@iisc.ac.in', 'Indian Institute of Science', 1, true, 'India'),
      author('a-20', 'Dr. Lars Nyström', 'l.nystrom@lu.se', 'Lund University', 2, false, 'Sweden'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-1',
        status: 'SUBMITTED',
        invited: '2026-01-29',
        responded: '2026-01-30',
        deadline: '2026-02-19',
        submitted: '2026-02-12',
        recommendation: 'accept',
        summary: 'Rigorous meta-analysis with appropriate heterogeneity handling. The residue cover threshold finding is practically important.',
        commentsToAuthor:
          'A rigorous meta-analysis. The heterogeneity analysis is properly done and the moderator analyses are well chosen.\n\n1. The effect of residue cover is the most practically useful finding in the paper and I would consider elevating it earlier in the discussion.\n2. Please ensure the PRISMA flow is reported in the main text.\n3. Publication bias: the funnel plot is included, but please add a quantitative assessment (Egger\'s test) given the number of studies.\n\nRecommend acceptance with the above minor additions.',
        commentsToEditor: 'Strong synthesis. Recommend acceptance.',
      }),
      review({
        reviewerId: 'u-rv-2',
        status: 'SUBMITTED',
        invited: '2026-01-29',
        responded: '2026-02-02',
        deadline: '2026-02-19',
        submitted: '2026-02-16',
        recommendation: 'minor-revisions',
        summary: 'Methodologically sound. The time-baseline heterogeneity should be handled more carefully.',
        commentsToAuthor:
          'The methodology is sound and the dataset is well assembled. My concern is the treatment of studies with different observation periods.\n\n1. Pooling studies with 3-year and 20-year observation periods biases the mean effect. Please either restrict the primary analysis to a common follow-up window or model time explicitly in the meta-regression.\n2. Figure 4 (forest plot of the residue cover moderator) needs the pooled estimate of the no-threshold group reported for comparison.\n\nOtherwise, good work.',
        commentsToEditor: 'Recommend acceptance after the time-baseline issue is addressed.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0105.pdf', 'Manuscript', 'PDF', 1, '2026-01-15', 'Dr. Ravi Deshmukh', 3890),
      file('Manuscript_JASSD-2026-0105_final.pdf', 'Manuscript', 'PDF', 3, '2026-03-20', 'Jonas Bergström', 4020, 'Version of record'),
      file('Figures_1-8.zip', 'Figures', 'ZIP', 2, '2026-02-20', 'Dr. Ravi Deshmukh', 25400),
      file('Study_Characteristics.xlsx', 'Supplementary', 'XLSX', 2, '2026-02-20', 'Dr. Lars Nyström', 1420),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Ravi Deshmukh', 'AUTHOR', '2026-01-15'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Rajesh Anand as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-01-19'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Dr. Rajesh Anand', 'EDITOR', '2026-01-28'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Ingrid Halvorsen — recommendation: accept.', 'Dr. Ingrid Halvorsen', 'REVIEWER', '2026-02-12'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Kwame Mensah — recommendation: minor revisions.', 'Dr. Kwame Mensah', 'REVIEWER', '2026-02-16'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Minor revisions requested from the author.', 'Dr. Rajesh Anand', 'EDITOR', '2026-02-18'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. Ravi Deshmukh', 'AUTHOR', '2026-02-20'),
      activity(ACTIVITY.SUBMISSION_ACCEPTED, 'Manuscript accepted following peer review.', 'Dr. Rajesh Anand', 'EDITOR', '2026-02-24'),
      activity(ACTIVITY.MOVED_TO_PRODUCTION, 'Article moved to production.', 'Jonas Bergström', 'ADMIN', '2026-02-25'),
      activity(ACTIVITY.ARTICLE_PUBLISHED, 'Article published in Volume 12, Issue 1.', 'Jonas Bergström', 'ADMIN', '2026-04-15'),
    ],
  },

  // ══ 9. Published via the ADMINISTRATIVE DIRECT-PUBLICATION path ══════
  {
    id: 'JASSD-2026-0141',
    title: 'Bridging the Gap Between Theory and Practice: An Editorial Perspective on Open Science Infrastructure in the Social Sciences',
    abstract:
      'Open science infrastructure has advanced rapidly in the natural sciences while lagging considerably in the social sciences, where disciplinary norms, ethical requirements around human subjects and divergent data-sharing practices continue to impede adoption. Drawing on editorial experience at this journal over the past five years, this article reviews the practical obstacles that social science researchers encounter when depositing data, preregistering studies and meeting increasingly stringent data availability requirements. We identify four recurring barriers — incentives misaligned with open practices, incompatible ethical consent models, disciplinary differences in what constitutes a re-identifiable record, and insufficient institutional support — and outline practical accommodations that journals can implement without compromising research integrity. We argue that editorial accommodation, rather than mandate, is the most effective mechanism for widening participation, and propose a graduated compliance framework.',
    keywords: ['Open Science', 'Research Infrastructure', 'Editorial Practice', 'Social Sciences', 'Data Availability'],
    status: S.PUBLISHED,
    articleType: 'Review Article',
    section: 'Research Policy',
    submitted: '2026-08-11',
    lastActivity: '2026-09-18',
    assignedEditorId: 'u-ed-5',
    doi: '10.48291/jassd.2026.0141',
    issueId: 'iss-12-3',
    publishedDate: '2026-09-18',
    volume: '12',
    issueNumber: '3',
    pages: '1–24',
    directPublication: true,
    directPublicationReason: 'Invited editorial contribution',
    authors: [
      author('a-21', 'Dr. Hannah Whitfield', 'h.whitfield@jassd.example.org', 'University of Melbourne', 1, true, 'Australia'),
    ],
    reviews: [],
    files: [
      file('Manuscript_JASSD-2026-0141.pdf', 'Manuscript', 'PDF', 1, '2026-08-11', 'Dr. Hannah Whitfield', 2960, 'Invited contribution'),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-08-11', 'Dr. Hannah Whitfield', 165),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Invited editorial contribution submitted by the handling editor.', 'Dr. Hannah Whitfield', 'EDITOR', '2026-08-11'),
      activity(
        ACTIVITY.DIRECT_PUBLICATION,
        'Article published directly by Administrator.',
        'Dr. Miriam Okonkwo',
        'ADMIN',
        '2026-09-18',
        'Invited editorial contribution',
      ),
    ],
  },

  // ══ 10. Rejected ═════════════════════════════════════════════════════
  {
    id: 'JASSD-2026-0122',
    title: 'A Comparative Assessment of Blockchain-Based Supply Chain Systems in Developing Economies',
    abstract:
      'Blockchain has been widely proposed as a solution for supply chain transparency in developing economies, yet empirical assessments of implementations remain scarce. This study reviews 34 blockchain-based supply chain implementations across 19 countries and evaluates their success against a framework of institutional compatibility, actor incentives and value chain complexity. Results indicate that implementations succeed primarily where a coordinating institution already existed and where the technology addressed a specific, well-defined coordination failure. Implementations motivated by a general desire for "transparency" without a specific coordination problem were uniformly unsuccessful. The paper provides a diagnosis of why many recent implementations have failed to deliver anticipated benefits and offers practical guidance for policymakers considering adoption.',
    keywords: ['Blockchain', 'Supply Chain', 'Developing Economies', 'Institutional Analysis', 'Technology Policy'],
    status: S.REJECTED,
    articleType: 'Research Article',
    section: 'Digital Systems',
    submitted: '2026-05-28',
    lastActivity: '2026-07-14',
    assignedEditorId: 'u-ed-1',
    authors: [
      author('a-22', 'Dr. Peter Kowalski', 'p.kowalski@uj.edu.pl', 'Jagiellonian University', 1, true, 'Poland'),
      author('a-23', 'Dr. Fatima Al-Rashid', 'f.alrashid@kaust.edu.sa', 'King Abdullah University of Science and Technology', 2, false, 'Saudi Arabia'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-5',
        status: 'SUBMITTED',
        invited: '2026-06-15',
        responded: '2026-06-17',
        deadline: '2026-07-06',
        submitted: '2026-07-01',
        recommendation: 'reject',
        summary:
          'The topic has been covered extensively and the paper does not advance the debate. The case selection appears opportunistic and the framework is applied post hoc.',
        commentsToAuthor:
          'I am unable to recommend publication in its current form.\n\n1. The core argument — that blockchain succeeds where a coordinating institution exists and fails otherwise — has been made in at least four papers since 2022, most recently in a comparable systematic review. The paper does not engage with this literature.\n\n2. The case selection criteria are not stated. Of the 34 cases, several appear to have been included because of available data rather than analytic relevance, which risks selection bias.\n\n3. The framework in Section 3 is developed after the cases have been described and appears to be fitted to the observed data rather than derived independently.\n\n4. The paper reads as a literature review presented as empirical research, which may be better suited to a different journal in this field.\n\nI would encourage the authors to consider resubmitting a substantially restructured version to a journal with a stronger methodological focus.',
        commentsToEditor:
          'I do not think this is suitable for the journal in its present form. The core argument is not new and the empirical basis is weak. The authors would be better served by a substantially restructured submission elsewhere.',
      }),
      review({
        reviewerId: 'u-rv-7',
        status: 'DECLINED',
        invited: '2026-06-15',
        declined: '2026-06-16',
        deadline: '2026-07-06',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0122.pdf', 'Manuscript', 'PDF', 1, '2026-05-28', 'Dr. Peter Kowalski', 3240),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-05-28', 'Dr. Peter Kowalski', 170),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Peter Kowalski', 'AUTHOR', '2026-05-28'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Elena Marchetti as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-06-02'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-06-14'),
      activity(ACTIVITY.REVIEWER_DECLINED, 'Dr. Yuki Tanaka declined the invitation due to competing commitments.', 'Dr. Yuki Tanaka', 'REVIEWER', '2026-06-16'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Amelia Foster — recommendation: reject.', 'Dr. Amelia Foster', 'REVIEWER', '2026-07-01'),
      activity(ACTIVITY.SUBMISSION_REJECTED, 'Manuscript declined following peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-07-14', 'The core argument duplicates recent literature and the case selection is not justified. The authors are encouraged to restructure and resubmit to a more methodologically focused venue.'),
    ],
  },

  // ══ 11. Author's own draft, for the Author role demo ══════════════════
  {
    id: 'JASSD-2026-0148',
    title: 'Groundwater Depletion and Cropping Intensity in the Eastern Cape: A Remote Sensing Approach',
    abstract:
      'DRAFT IN PROGRESS. This study will combine Sentinel-2 time series with district-level abstraction licence records to assess the relationship between groundwater depletion and cropping intensity in the Eastern Cape between 2016 and 2025.',
    keywords: ['Groundwater', 'Remote Sensing', 'Agriculture', 'Water Resources'],
    status: S.DRAFT,
    articleType: 'Research Article',
    section: 'Environmental Systems',
    submitted: null,
    lastActivity: '2026-09-28',
    assignedEditorId: null,
    authors: [
      author('a-24', 'Dr. Amara Nwosu', 'a.nwosu@uct.ac.za', 'University of Cape Town', 1, true, 'South Africa'),
    ],
    reviews: [],
    files: [],
    activity: [
      activity(ACTIVITY.SUBMISSION_CREATED, 'Draft created by the author.', 'Dr. Amara Nwosu', 'AUTHOR', '2026-09-28'),
    ],
  },

  // ══ 12. New submission, unassigned editor ════════════════════════════
  {
    id: 'JASSD-2026-0149',
    title: 'Digital Health Interventions and Continuity of Care in Rural Primary Health Systems',
    abstract:
      'Digital health interventions are widely promoted as a route to strengthening primary care in resource-constrained rural settings, but evidence on their effect on continuity of care is limited. This mixed-methods study combines a cluster randomised trial in 24 rural health centres across three provinces with 62 in-depth interviews with patients, nurses and district managers. Clinics assigned to the digital package showed a 19% improvement in treatment-continuity index scores at six months, with the largest gains among patients living more than five kilometres from a facility. Interviews indicate that the benefit was driven less by the technology itself than by the reminder and follow-up protocols it enabled. We argue that digital health investment should be evaluated on the care pathways it supports rather than on adoption metrics.',
    keywords: ['Digital Health', 'Primary Care', 'Rural Health Systems', 'Continuity of Care', 'Health Informatics'],
    status: S.SUBMITTED,
    articleType: 'Research Article',
    section: 'Biomedical Engineering',
    submitted: '2026-09-27',
    lastActivity: '2026-09-27',
    assignedEditorId: null,
    authors: [
      author('a-25', 'Dr. Grace Mbeki', 'g.mbeki@uct.ac.za', 'University of Cape Town', 1, true, 'South Africa'),
      author('a-26', 'Dr. Sunil Prasad', 's.prasad@ntu.ac.in', 'National University of Singapore', 2, false, 'Singapore'),
      author('a-27', 'Dr. Samuel Adeyinka', 's.adeyinka@unilag.edu.ng', 'University of Lagos', 3, false, 'Nigeria'),
    ],
    reviews: [],
    files: [
      file('Manuscript_JASSD-2026-0149.pdf', 'Manuscript', 'PDF', 1, '2026-09-27', 'Dr. Grace Mbeki', 4420),
      file('Figures_1-7.zip', 'Figures', 'ZIP', 1, '2026-09-27', 'Dr. Grace Mbeki', 24600),
      file('Trial_Registration.pdf', 'Supplementary', 'PDF', 1, '2026-09-27', 'Dr. Sunil Prasad', 720),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Grace Mbeki', 'AUTHOR', '2026-09-27'),
    ],
  },

  // ══ 13. Under review, all reports in ════════════════════════════════
  {
    id: 'JASSD-2026-0140',
    title: 'Assessing the Trade-Offs Between Water Saving and Crop Yield in Irrigated Agriculture',
    abstract:
      'Water-saving technologies such as drip irrigation and sensor-based scheduling are promoted as the principal route to agricultural water efficiency, but their effect on yields is contested. This study analyses four seasons of paired plot data from 12 experimental stations to quantify the yield penalty associated with progressively tighter irrigation schedules. Under mild deficit irrigation (90–70% of evapotranspiration) yields fell by 4.2% on average, but water productivity rose by 17%. Beyond a threshold of approximately 60% of evapotranspiration, yields declined non-linearly while water productivity plateaued, indicating that the efficiency gains offered by further restriction are illusory. We argue that deficit irrigation policy should be framed around explicit yield trade-offs rather than presented as a cost-free efficiency gain.',
    keywords: ['Irrigation', 'Water Productivity', 'Crop Yield', 'Deficit Irrigation', 'Agricultural Water Management'],
    status: S.UNDER_REVIEW,
    articleType: 'Research Article',
    section: 'Agricultural Systems',
    submitted: '2026-07-30',
    lastActivity: '2026-09-18',
    assignedEditorId: 'u-ed-6',
    authors: [
      author('a-28', 'Dr. Fatma Zahra Alaoui', 'f.alaoui@um6p.ma', 'Mohammed VI Polytechnic University', 1, true, 'Morocco'),
      author('a-29', 'Dr. Nabil Farouk', 'n.farouk@auc.edu.eg', 'American University in Cairo', 2, false, 'Egypt'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-10',
        status: 'SUBMITTED',
        invited: '2026-08-14',
        responded: '2026-08-15',
        deadline: '2026-09-04',
        submitted: '2026-09-02',
        recommendation: 'minor-revisions',
        summary:
          'A well-designed station trial addressing a question of real practical importance. The threshold analysis is the strongest element and deserves clearer emphasis.',
        commentsToAuthor:
          'This is a careful and practically useful study. The central finding — that water productivity plateaus once irrigation falls below roughly 60% of evapotranspiration — is one that policy documents frequently get wrong, and the experimental support here is welcome.\n\n1. Please report the threshold estimate with a confidence interval, and test its sensitivity to the smoothing bandwidth used to detect the knee point.\n2. The four-season design is well used, but the third season experienced an unusually wet period. The authors should clarify how this affected treatment application.\n3. Section 3.2 conflates field water productivity with basin-level water productivity in a way that could mislead readers. Please separate them.\n\nMinor revisions only.',
        commentsToEditor: 'Solid and relevant. Recommend acceptance after the threshold uncertainty is quantified.',
      }),
      review({
        reviewerId: 'u-rv-6',
        status: 'SUBMITTED',
        invited: '2026-08-14',
        responded: '2026-08-16',
        deadline: '2026-09-04',
        submitted: '2026-09-05',
        recommendation: 'accept',
        summary:
          'Useful and clearly written. The policy implications are stated proportionately and are well supported.',
        commentsToAuthor:
          'A useful contribution that addresses a common policy misconception. I have no substantive concerns.\n\nMinor points only: Table 4 would benefit from units in the column headers, and the abbreviation list should include ETc, which is used before definition.\n\nI recommend acceptance.',
        commentsToEditor: 'Recommend acceptance. Good fit for the agricultural systems section.',
      }),
      review({
        reviewerId: 'u-rv-1',
        status: 'ACCEPTED',
        invited: '2026-08-14',
        responded: '2026-08-18',
        deadline: '2026-09-25',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0140.pdf', 'Manuscript', 'PDF', 1, '2026-07-30', 'Dr. Fatma Zahra Alaoui', 3760),
      file('Figures_1-6.zip', 'Figures', 'ZIP', 1, '2026-07-30', 'Dr. Fatma Zahra Alaoui', 18900),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-07-30', 'Dr. Fatma Zahra Alaoui', 205),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Fatma Zahra Alaoui', 'AUTHOR', '2026-07-30'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Nabil Farouk as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-08-01'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Dr. Nabil Farouk', 'EDITOR', '2026-08-12'),
      activity(ACTIVITY.REVIEWER_INVITED, 'Invited Dr. Fatima Zahra Alaoui, Dr. Ravi Deshmukh and Dr. Ingrid Halvorsen to review.', 'Dr. Nabil Farouk', 'EDITOR', '2026-08-14'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Fatima Zahra Alaoui — recommendation: minor revisions.', 'Dr. Fatima Zahra Alaoui', 'REVIEWER', '2026-09-02'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Ravi Deshmukh — recommendation: accept.', 'Dr. Ravi Deshmukh', 'REVIEWER', '2026-09-05'),
      activity(ACTIVITY.REVIEWER_ACCEPTED, 'Dr. Ingrid Halvorsen accepted the invitation.', 'Dr. Ingrid Halvorsen', 'REVIEWER', '2026-08-18'),
    ],
  },

  // ══ 14. Second round after revision ══════════════════════════════════
  {
    id: 'JASSD-2026-0133',
    title: 'Life Cycle Assessment of Renewable Energy Systems: A Critical Review of Boundary Selection',
    abstract:
      'Published life cycle assessments of renewable energy systems vary substantially in their results, and a recurring source of divergence is the selection of system boundaries. This critical review examines 148 LCA studies of wind, solar and hydropower published between 2010 and 2024, coding each for boundary choices across construction, operation, decommissioning, and grid infrastructure. We find that construction-phase assumptions account for the largest share of between-study variance, exceeding operational parameters. Studies applying harmonised boundary rules yield materially narrower result ranges. The review provides a reporting checklist intended to make future cross-technology comparisons more robust.',
    keywords: ['Life Cycle Assessment', 'Renewable Energy', 'System Boundaries', 'Sustainability Assessment', 'Energy Systems'],
    status: S.UNDER_REVIEW,
    articleType: 'Review Article',
    section: 'Sustainable Development',
    submitted: '2026-06-24',
    lastActivity: '2026-09-24',
    assignedEditorId: 'u-ed-1',
    authors: [
      author('a-30', 'Dr. Lars Sørensen', 'l.sorensen@au.dk', 'Aarhus University', 1, true, 'Denmark'),
      author('a-31', 'Dr. Henrik Lund', 'h.lund@ku.dk', 'University of Copenhagen', 2, false, 'Denmark'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-9',
        status: 'SUBMITTED',
        invited: '2026-07-15',
        responded: '2026-07-16',
        deadline: '2026-08-05',
        submitted: '2026-08-01',
        recommendation: 'major-revisions',
        summary:
          'The underlying corpus is valuable, but the coding scheme needs to be applied consistently and the variance decomposition justified.',
        commentsToAuthor:
          'A useful and timely review, and the 148-study corpus is a substantial contribution. My concern is methodological consistency.\n\n1. The coding of boundary categories appears to allow multiple codes per study in some cases and single codes in others. The rules for this need to be stated explicitly, and inter-rater agreement reported.\n\n2. The variance decomposition is the paper\'s key claim and needs a stronger justification. Why should boundary selection be expected to dominate, and has this been tested rather than asserted?\n\n3. Round two of this review: the manuscript has been substantially revised since my first report. The coding appendix is a genuine improvement. However, two studies in my sample remain uncoded and the variance decomposition still relies on a single regression specification.\n\nI would support publication once the remaining coding gaps are closed.',
        commentsToEditor: 'The revision has addressed most of my concerns. Two coding gaps remain but these are minor. I do not wish to block publication over them.',
      }),
      review({
        reviewerId: 'u-rv-13',
        status: 'SUBMITTED',
        invited: '2026-07-15',
        responded: '2026-07-17',
        deadline: '2026-08-05',
        submitted: '2026-08-03',
        recommendation: 'minor-revisions',
        summary: 'The reporting checklist is practical and likely to be adopted by the field.',
        commentsToAuthor:
          'I welcome this review. The checklist in Table 6 is the most immediately useful output and I would encourage the authors to circulate it more widely.\n\n1. The checklist would be more usable if each item specified the reporting unit and time horizon, not just the parameter.\n2. Please add a short worked example applying the checklist to a single technology.\n3. Round two: the worked example has been added, which resolves my earlier concern about usability. I am satisfied with this point.\n\nMinor revisions only.',
        commentsToEditor: 'Recommend acceptance. The checklist alone justifies publication.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0133.pdf', 'Manuscript', 'PDF', 1, '2026-06-24', 'Dr. Lars Sørensen', 5210),
      file('Manuscript_JASSD-2026-0133_rev1.pdf', 'Manuscript', 'PDF', 2, '2026-08-28', 'Dr. Lars Sørensen', 5640, 'Revised with coding appendix'),
      file('Coding_Appendix.xlsx', 'Supplementary', 'XLSX', 2, '2026-08-28', 'Dr. Henrik Lund', 3860),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-06-24', 'Dr. Lars Sørensen', 180),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Lars Sørensen', 'AUTHOR', '2026-06-24'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Prof. Elena Marchetti as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-06-27'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-07-14'),
      activity(ACTIVITY.REVIEWER_INVITED, 'Invited Dr. Henrik Lund and Dr. Isabel Moreno to review.', 'Prof. Elena Marchetti', 'EDITOR', '2026-07-15'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Round 1 review submitted by Dr. Henrik Lund — recommendation: major revisions.', 'Dr. Henrik Lund', 'REVIEWER', '2026-08-01'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Round 1 review submitted by Dr. Isabel Moreno — recommendation: minor revisions.', 'Dr. Isabel Moreno', 'REVIEWER', '2026-08-03'),
      activity(ACTIVITY.REVISION_REQUESTED, 'Major revisions requested from the author.', 'Prof. Elena Marchetti', 'EDITOR', '2026-08-06', 'Coding scheme consistency and the variance decomposition require a firmer methodological basis.'),
      activity(ACTIVITY.REVISION_UPLOADED, 'Revised manuscript uploaded by the author (version 2).', 'Dr. Lars Sørensen', 'AUTHOR', '2026-08-28'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Returned to the same reviewers for a second round.', 'Prof. Elena Marchetti', 'EDITOR', '2026-09-05'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Round 2 review submitted by Dr. Henrik Lund — recommendation: minor revisions.', 'Dr. Henrik Lund', 'REVIEWER', '2026-09-22'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Round 2 review submitted by Dr. Isabel Moreno — recommendation: minor revisions.', 'Dr. Isabel Moreno', 'REVIEWER', '2026-09-24'),
    ],
  },

  // ══ 15. Rejected after a second round ════════════════════════════════
  {
    id: 'JASSD-2026-0119',
    title: 'Social Media Engagement and Academic Reputation: A Quantitative Meta-Analysis',
    abstract:
      'The relationship between social media engagement and measures of academic reputation remains poorly characterised. This meta-analysis synthesises 96 studies reporting correlations between researcher social media activity and citation-based or survey-based reputation measures. A small but statistically significant positive association is observed overall (r = 0.11), but the effect is substantially smaller when restricted to studies controlling for field and career stage. We find evidence of strong publication bias, with the asymmetry test approaching significance, and note that 43 of the included studies report effect sizes that cannot be reproduced from the underlying data.',
    keywords: ['Social Media', 'Academic Reputation', 'Meta-Analysis', 'Citation Impact', 'Altmetrics'],
    status: S.REJECTED,
    articleType: 'Review Article',
    section: 'Research Policy',
    submitted: '2026-04-22',
    lastActivity: '2026-07-29',
    assignedEditorId: 'u-ed-5',
    authors: [
      author('a-32', 'Dr. Elena Ruiz', 'e.ruiz@unam.mx', 'Universidad Nacional Autónoma de México', 1, true, 'Mexico'),
      author('a-33', 'Dr. Michael Osei', 'm.osei@uew.edu.gh', 'University of Education, Winneba', 2, false, 'Ghana'),
    ],
    reviews: [
      review({
        reviewerId: 'u-rv-14',
        status: 'SUBMITTED',
        invited: '2026-05-12',
        responded: '2026-05-13',
        deadline: '2026-06-02',
        submitted: '2026-05-28',
        recommendation: 'reject',
        summary:
          'The data quality problems are serious enough that the pooled estimate cannot be interpreted. Several effect sizes appear unreproducible.',
        commentsToAuthor:
          'I have concerns that go beyond the usual requests for revision, and I do not think the pooled estimate in the current form can be interpreted.\n\n1. Reproducibility: At least 43 of the 96 included studies report effect sizes that cannot be reproduced from the underlying data. This is not a minor concern — it suggests either systematic extraction error or more serious problems in the primary literature. The authors should attempt to reproduce the full set, not a sample.\n\n2. Publication bias: The authors note the asymmetry test approaches significance but proceed to interpret the pooled estimate. With a corpus of this size and this quality, the funnel plot cannot be treated as reassuring.\n\n3. Framing: A correlation of r = 0.11, once the field and career-stage controls are applied, is very close to nothing. Presenting it as a meaningful relationship overstates the finding.\n\nI would encourage the authors to treat this as a data-quality commentary rather than a meta-analysis.',
        commentsToEditor: 'The reproducibility problems are extensive. I do not think this belongs in the journal in its current form.',
      }),
      review({
        reviewerId: 'u-rv-5',
        status: 'SUBMITTED',
        invited: '2026-05-12',
        responded: '2026-05-14',
        deadline: '2026-06-02',
        submitted: '2026-05-30',
        recommendation: 'major-revisions',
        summary: 'Interesting question, but the extraction methodology needs to be auditable before the results can be trusted.',
        commentsToAuthor:
          'I agree with the underlying concern about the literature, and a piece examining that would be valuable. The problem is that the current manuscript attempts to pool the results as though the corpus were sound.\n\n1. The extraction protocol needs to be fully specified and the extraction sheet released as supplementary material.\n2. A sensitivity analysis excluding studies with unreproducible effect sizes should be reported.\n3. The interpretation section should be substantially more cautious.\n\nMajor revisions would be needed, and I am not confident the pooled analysis would survive them.',
        commentsToEditor: 'A worthwhile question, but I agree the current analysis is not defensible.',
      }),
    ],
    files: [
      file('Manuscript_JASSD-2026-0119.pdf', 'Manuscript', 'PDF', 1, '2026-04-22', 'Dr. Elena Ruiz', 4180),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-04-22', 'Dr. Elena Ruiz', 190),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Manuscript submitted to the journal.', 'Dr. Elena Ruiz', 'AUTHOR', '2026-04-22'),
      activity(ACTIVITY.EDITOR_ASSIGNED, 'Assigned to Dr. Hannah Whitfield as handling editor.', 'Dr. Miriam Okonkwo', 'ADMIN', '2026-04-25'),
      activity(ACTIVITY.SENT_TO_REVIEW, 'Sent for external peer review.', 'Dr. Hannah Whitfield', 'EDITOR', '2026-05-11'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Michael Osei — recommendation: reject.', 'Dr. Michael Osei', 'REVIEWER', '2026-05-28'),
      activity(ACTIVITY.REVIEW_SUBMITTED, 'Review submitted by Dr. Amelia Foster — recommendation: major revisions.', 'Dr. Amelia Foster', 'REVIEWER', '2026-05-30'),
      activity(
        ACTIVITY.SUBMISSION_REJECTED,
        'Manuscript declined following peer review.',
        'Dr. Hannah Whitfield',
        'EDITOR',
        '2026-07-29',
        'Both reviewers identify extensive reproducibility problems in the primary corpus. The pooled estimate cannot be interpreted. A reframed submission examining data quality in this literature — rather than pooling it — may be worthwhile.',
      ),
    ],
  },

  // ══ 16. Published via direct publication (society proceedings) ═══════
  {
    id: 'JASSD-2026-0144',
    title: 'Proceedings of the 12th International Symposium on Sustainable Agriculture Systems',
    abstract:
      'These proceedings collect 14 extended abstracts presented at the 12th International Symposium on Sustainable Agriculture Systems, held in Cape Town from 3 to 6 March 2026. Contributions span precision irrigation scheduling, integrated pest management, soil carbon monitoring and agricultural extension under climate stress. Extended abstracts are published without external peer review following presentation and editorial screening.',
    keywords: ['Proceedings', 'Sustainable Agriculture', 'Conference', 'Extended Abstracts', 'Research Networks'],
    status: S.PUBLISHED,
    articleType: 'Short Communication',
    section: 'Agricultural Systems',
    submitted: '2026-08-20',
    lastActivity: '2026-09-20',
    assignedEditorId: 'u-ed-2',
    doi: '10.48291/jassd.2026.0144',
    issueId: 'iss-12-3',
    publishedDate: '2026-09-20',
    volume: '12',
    issueNumber: '3',
    pages: '169–201',
    directPublication: true,
    directPublicationReason: 'Society proceedings paper',
    authors: [
      author('a-34', 'Dr. Samuel Adeyinka', 's.adeyinka@unilag.edu.ng', 'University of Lagos', 1, true, 'Nigeria'),
      author('a-35', 'Prof. Deborah Wanjiru', 'd.wanjiru@jkuat.ac.ke', 'Jomo Kenyatta University of Agriculture and Technology', 2, false, 'Kenya'),
    ],
    reviews: [],
    files: [
      file('Proceedings_Abstracts.pdf', 'Manuscript', 'PDF', 1, '2026-08-20', 'Dr. Samuel Adeyinka', 6240, 'Consolidated extended abstracts'),
      file('Cover_Letter.pdf', 'Cover Letter', 'PDF', 1, '2026-08-20', 'Dr. Samuel Adeyinka', 175),
    ],
    activity: [
      activity(ACTIVITY.SUBMISSION_RECEIVED, 'Society proceedings submitted for publication.', 'Dr. Samuel Adeyinka', 'AUTHOR', '2026-08-20'),
      activity(
        ACTIVITY.DIRECT_PUBLICATION,
        'Article published directly by Administrator.',
        'Dr. Miriam Okonkwo',
        'ADMIN',
        '2026-09-20',
        'Society proceedings paper',
      ),
    ],
  },
]

// Attach submission ids to nested records so detail pages can look them up.
for (const s of submissions) {
  s.activity = s.activity.map((a) => ({ ...a, submissionId: s.id }))
  for (const r of s.reviews) r.submissionId = s.id
}

export const getSubmission = (id) => submissions.find((s) => s.id === id)
