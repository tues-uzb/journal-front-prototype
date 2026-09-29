/**
 * New submission wizard.
 *
 * A five-step author workflow: article information, authors, files,
 * additional information, and review & submit. Frontend only — the file step
 * records file names locally and performs no upload.
 *
 * @module pages/NewSubmission
 */

import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'

import { Page, PageHeader, Panel, Note } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

const STEPS = [
  { key: 'article', label: 'Article information', icon: 'file' },
  { key: 'authors', label: 'Authors', icon: 'users' },
  { key: 'files', label: 'Upload manuscript', icon: 'upload' },
  { key: 'additional', label: 'Additional information', icon: 'clipboard' },
  { key: 'review', label: 'Review and submit', icon: 'checkCircle' },
]

const ARTICLE_TYPES = ['Research Article', 'Review Article', 'Case Study', 'Short Communication']
const SECTIONS = [
  'Agricultural Systems',
  'Biomedical Engineering',
  'Digital Systems',
  'Education & Learning Sciences',
  'Environmental Systems',
  'Research Policy',
  'Sustainable Development',
  'Urban & Infrastructure',
]

const KEYWORD_SUGGESTIONS = [
  'Machine Learning',
  'Sustainability',
  'Climate Change',
  'Remote Sensing',
  'Public Policy',
  'Digital Transformation',
  'Health Systems',
  'Urban Planning',
]

export default function NewSubmission() {
  const navigate = useNavigate()
  const { user, pushToast } = useOutletContext()
  const addSubmission = useJournalStore((s) => s.addSubmission)

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    abstract: '',
    keywords: [],
    articleType: 'Research Article',
    section: '',
    authors: [
      {
        name: user.name,
        email: user.email,
        affiliation: user.affiliation ?? '',
        country: user.country ?? '',
        isCorresponding: true,
      },
    ],
    files: [],
    funding: 'none',
    fundingStatement: '',
    dataAvailability: 'available-on-request',
    ethicsStatement: 'not-required',
    conflicts: '',
    suggestedReviewers: [],
  })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  /* ── Validation per step ───────────────────────────────────────────── */

  const validate = (index) => {
    const e = {}
    if (index === 0) {
      if (!form.title.trim()) e.title = 'A title is required.'
      else if (form.title.trim().length < 20) e.title = 'Titles should be at least 20 characters.'
      if (!form.abstract.trim()) e.abstract = 'An abstract is required.'
      else if (form.abstract.trim().length < 100) e.abstract = 'Abstracts should be at least 100 characters.'
      if (form.keywords.length === 0) e.keywords = 'Add at least one keyword.'
      if (!form.section) e.section = 'Select a journal section.'
    }
    if (index === 1) {
      if (form.authors.length === 0) e.authors = 'At least one author is required.'
      if (!form.authors.some((a) => a.isCorresponding)) e.authors = 'One author must be the corresponding author.'
      form.authors.forEach((a, i) => {
        if (!a.name.trim()) e[`author-${i}`] = 'Name is required.'
        if (!/^\S+@\S+\.\S+$/.test(a.email)) e[`author-email-${i}`] = 'Enter a valid email address.'
        if (!a.affiliation.trim()) e[`author-aff-${i}`] = 'Affiliation is required.'
      })
    }
    if (index === 2) {
      if (form.files.length === 0) e.files = 'Attach at least one manuscript file.'
      if (!form.files.some((f) => f.type === 'Manuscript')) e.files = 'A manuscript file is required.'
    }
    if (index === 3) {
      if (form.funding !== 'none' && !form.fundingStatement.trim()) {
        e.funding = 'Provide a funding statement, or select "No funding".'
      }
      if (form.conflicts.length > 0 && !form.conflicts.trim()) e.conflicts = 'Detail the conflicts, or leave blank.'
    }
    return e
  }

  const stepErrors = validate(step)
  const isValid = Object.keys(stepErrors).length === 0

  const next = () => {
    setTouched(true)
    if (!isValid) return
    setTouched(false)
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    setTouched(false)
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Keyword handling ──────────────────────────────────────────────── */

  const addKeyword = (raw) => {
    const k = raw.trim().replace(/,$/, '')
    if (!k) return
    if (form.keywords.length >= 8) return
    if (form.keywords.some((x) => x.toLowerCase() === k.toLowerCase())) return
    set({ keywords: [...form.keywords, k] })
    setKeywordInput('')
  }

  /* ── Author handling ───────────────────────────────────────────────── */

  const setAuthor = (i, patch) =>
    set({ authors: form.authors.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) })

  const addAuthor = () =>
    set({
      authors: [...form.authors, { name: '', email: '', affiliation: '', country: '', isCorresponding: false }],
    })

  const removeAuthor = (i) => set({ authors: form.authors.filter((_, idx) => idx !== i) })

  const makeCorresponding = (i) =>
    set({ authors: form.authors.map((a, idx) => ({ ...a, isCorresponding: idx === i })) })

  /* ── File handling (no upload) ─────────────────────────────────────── */

  const addFile = (e) => {
    const picked = Array.from(e.target.files ?? [])
    if (!picked.length) return
    const next = picked.map((f) => ({
      id: `f-${Date.now()}-${f.name}`,
      name: f.name,
      type: f.name.toLowerCase().endsWith('.pdf') ? 'Manuscript' : 'Supplementary',
      format: f.name.split('.').pop().toUpperCase(),
      version: 1,
      uploaded: '2026-09-29',
      uploadedBy: user.name,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
    }))
    set({ files: [...form.files, ...next] })
    e.target.value = ''
  }

  const removeFile = (id) => set({ files: form.files.filter((f) => f.id !== id) })

  const changeType = (id, type) =>
    set({ files: form.files.map((f) => (f.id === id ? { ...f, type } : f)) })

  /* ── Submit ────────────────────────────────────────────────────────── */

  const submit = () => {
    for (let i = 0; i < 4; i += 1) {
      const e = validate(i)
      if (Object.keys(e).length) {
        setStep(i)
        setErrors(e)
        setTouched(true)
        return
      }
    }
    addSubmission(form)
    pushToast({
      tone: 'success',
      title: 'Manuscript submitted',
      message: 'Your submission is now with the editorial team. You will be notified of the outcome.',
    })
    navigate('/my-submissions')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <Page className="max-w-4xl">
      <Link to="/my-submissions" className="btn-ghost btn-sm -ml-2 mb-4">
        <Icon name="chevronLeft" size={15} />
        My submissions
      </Link>

      <PageHeader
        title="New submission"
        description="Complete each step to submit your manuscript for peer review."
      />

      {/* Stepper */}
      <nav className="mt-7" aria-label="Submission progress">
        <div className="h-1 overflow-hidden rounded-full bg-ink-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="mt-4 grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'todo'
            return (
              <li key={s.key} className="min-w-0">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex w-full flex-col items-start gap-1.5 text-left ${
                    i < step ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold transition ${
                      state === 'done'
                        ? 'bg-brand-600 text-white'
                        : state === 'current'
                          ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                          : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {state === 'done' ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={`text-[0.6875rem] leading-tight font-medium ${
                      state === 'current' ? 'text-ink-900' : state === 'done' ? 'text-brand-700' : 'text-ink-400'
                    }`}
                  >
                    <span className="hidden sm:block">{s.label}</span>
                    <span className="sm:hidden">Step {i + 1}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <Panel className="mt-6" bodyClassName="px-5 py-6 sm:px-6">
        {/* ══ STEP 1 — Article information ══ */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="title">
                Article title <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                onBlur={() => setTouched(true)}
                placeholder="Enter the full title of your manuscript"
                className={`input ${touched && errors.title ? 'border-rose-400' : ''}`}
              />
              <div className="mt-1.5 flex items-center justify-between">
                {touched && errors.title ? <p className="error-text">{errors.title}</p> : <span />}
                <span className="text-xs text-ink-400">{form.title.length} characters</span>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="abstract">
                Abstract <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="abstract"
                rows={9}
                value={form.abstract}
                onChange={(e) => set({ abstract: e.target.value })}
                onBlur={() => setTouched(true)}
                placeholder="Summarise the background, methods, principal findings and conclusions. Plain text only — formatting is not preserved."
                className={`textarea ${touched && errors.abstract ? 'border-rose-400' : ''}`}
              />
              {touched && errors.abstract ? (
                <p className="error-text">{errors.abstract}</p>
              ) : (
                <p className="hint">Between 150 and 350 words is typical for this journal.</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="keywords">
                Keywords <span className="text-rose-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      addKeyword(keywordInput)
                    }
                  }}
                  onBlur={() => addKeyword(keywordInput)}
                  placeholder="Type a keyword and press Enter"
                  className={`input ${touched && errors.keywords ? 'border-rose-400' : ''}`}
                  disabled={form.keywords.length >= 8}
                />
                <button type="button" onClick={() => addKeyword(keywordInput)} className="btn-secondary shrink-0">
                  Add
                </button>
              </div>
              {touched && errors.keywords && <p className="error-text">{errors.keywords}</p>}

              {form.keywords.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {form.keywords.map((k) => (
                    <span key={k} className="chip bg-brand-50 text-brand-700 ring-brand-200">
                      {k}
                      <button
                        onClick={() => set({ keywords: form.keywords.filter((x) => x !== k) })}
                        className="ml-0.5 hover:text-brand-900"
                        aria-label={`Remove ${k}`}
                      >
                        <Icon name="close" size={11} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <p className="text-xs text-ink-500">Suggested:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {KEYWORD_SUGGESTIONS.filter((s) => !form.keywords.includes(s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => addKeyword(s)}
                      disabled={form.keywords.length >= 8}
                      className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[0.6875rem] text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="type">
                  Article type
                </label>
                <select
                  id="type"
                  value={form.articleType}
                  onChange={(e) => set({ articleType: e.target.value })}
                  className="select"
                >
                  {ARTICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="section">
                  Journal section <span className="text-rose-600">*</span>
                </label>
                <select
                  id="section"
                  value={form.section}
                  onChange={(e) => set({ section: e.target.value })}
                  onBlur={() => setTouched(true)}
                  className={`select ${touched && errors.section ? 'border-rose-400' : ''}`}
                >
                  <option value="">Select a section…</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {touched && errors.section && <p className="error-text">{errors.section}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Authors ══ */}
        {step === 1 && (
          <div className="space-y-5">
            <Note tone="info" icon="info">
              List all authors in publication order. Designate one corresponding author who will receive all editorial
              correspondence.
            </Note>

            <ul className="space-y-4">
              {form.authors.map((a, i) => (
                <li key={i} className="rounded-xl border border-ink-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.8125rem] font-semibold text-ink-900">Author {i + 1}</p>
                    {form.authors.length > 1 && (
                      <button onClick={() => removeAuthor(i)} className="btn-danger-ghost btn-sm">
                        <Icon name="trash" size={13} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor={`an-${i}`}>
                        Full name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id={`an-${i}`}
                        value={a.name}
                        onChange={(e) => setAuthor(i, { name: e.target.value })}
                        onBlur={() => setTouched(true)}
                        className={`input ${touched && errors[`author-${i}`] ? 'border-rose-400' : ''}`}
                      />
                      {touched && errors[`author-${i}`] && <p className="error-text">{errors[`author-${i}`]}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor={`ae-${i}`}>
                        Email <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id={`ae-${i}`}
                        type="email"
                        value={a.email}
                        onChange={(e) => setAuthor(i, { email: e.target.value })}
                        onBlur={() => setTouched(true)}
                        className={`input ${touched && errors[`author-email-${i}`] ? 'border-rose-400' : ''}`}
                      />
                      {touched && errors[`author-email-${i}`] && (
                        <p className="error-text">{errors[`author-email-${i}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label" htmlFor={`aa-${i}`}>
                        Affiliation <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id={`aa-${i}`}
                        value={a.affiliation}
                        onChange={(e) => setAuthor(i, { affiliation: e.target.value })}
                        onBlur={() => setTouched(true)}
                        placeholder="Institution, department"
                        className={`input ${touched && errors[`author-aff-${i}`] ? 'border-rose-400' : ''}`}
                      />
                      {touched && errors[`author-aff-${i}`] && (
                        <p className="error-text">{errors[`author-aff-${i}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label" htmlFor={`ac-${i}`}>
                        Country
                      </label>
                      <input
                        id={`ac-${i}`}
                        value={a.country}
                        onChange={(e) => setAuthor(i, { country: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  <label className="mt-3.5 flex items-center gap-2 text-[0.8125rem] text-ink-700">
                    <input
                      type="radio"
                      name="corresponding"
                      checked={a.isCorresponding}
                      onChange={() => makeCorresponding(i)}
                      className="h-3.5 w-3.5 accent-brand-600"
                    />
                    Corresponding author
                  </label>
                </li>
              ))}
            </ul>

            {touched && errors.authors && <p className="error-text">{errors.authors}</p>}

            <button onClick={addAuthor} className="btn-secondary" disabled={form.authors.length >= 12}>
              <Icon name="userPlus" size={15} />
              Add another author
            </button>
          </div>
        )}

        {/* ══ STEP 3 — Files ══ */}
        {step === 2 && (
          <div className="space-y-5">
            <Note tone="warning" icon="info" title="Prototype upload">
              No files are transmitted or stored. The browser file picker is used to capture names only, so the workflow
              can be demonstrated end to end.
            </Note>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-300 bg-ink-50/50 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
              <Icon name="upload" size={26} className="text-ink-400" />
              <span className="mt-3 text-sm font-medium text-ink-800">Choose manuscript files</span>
              <span className="mt-1 text-xs text-ink-500">PDF or DOCX for the manuscript, ZIP for figures</span>
              <input type="file" multiple className="sr-only" onChange={addFile} />
            </label>

            {touched && errors.files && <p className="error-text">{errors.files}</p>}

            {form.files.length > 0 && (
              <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
                {form.files.map((f) => (
                  <li key={f.id} className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Icon name="file" size={16} className="shrink-0 text-ink-400" />
                      <div className="min-w-0">
                        <p className="truncate text-[0.8125rem] font-medium text-ink-900">{f.name}</p>
                        <p className="text-xs text-ink-500">
                          {f.format} · {f.sizeKb} KB · v{f.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={f.type}
                        onChange={(e) => changeType(f.id, e.target.value)}
                        className="select btn-sm w-auto"
                        aria-label={`File type for ${f.name}`}
                      >
                        <option>Manuscript</option>
                        <option>Figures</option>
                        <option>Cover Letter</option>
                        <option>Supplementary</option>
                      </select>
                      <button onClick={() => removeFile(f.id)} className="btn-danger-ghost btn-sm" aria-label="Remove file">
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
              <p className="text-[0.8125rem] font-medium text-ink-800">Accepted file types</p>
              <ul className="mt-2 space-y-1 text-[0.8125rem] text-ink-600">
                <li>· Manuscript — PDF or DOCX, anonymised for double-blind review</li>
                <li>· Figures — ZIP, TIFF or EPS at 300 dpi minimum</li>
                <li>· Cover letter — PDF, optional but encouraged</li>
                <li>· Supplementary data — XLSX, CSV or ZIP</li>
              </ul>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — Additional information ══ */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="funding">
                Funding
              </label>
              <select
                id="funding"
                value={form.funding}
                onChange={(e) => set({ funding: e.target.value })}
                className="select"
              >
                <option value="none">No funding</option>
                <option value="public">Public or government funding</option>
                <option value="private">Private or commercial funding</option>
                <option value="mixed">Mixed funding</option>
              </select>
            </div>

            {form.funding !== 'none' && (
              <div>
                <label className="label" htmlFor="funding-statement">
                  Funding statement <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="funding-statement"
                  rows={3}
                  value={form.fundingStatement}
                  onChange={(e) => set({ fundingStatement: e.target.value })}
                  onBlur={() => setTouched(true)}
                  placeholder="Funder, grant number and recipient…"
                  className={`textarea ${touched && errors.funding ? 'border-rose-400' : ''}`}
                />
                {touched && errors.funding && <p className="error-text">{errors.funding}</p>}
              </div>
            )}

            <div>
              <label className="label" htmlFor="data">
                Data availability
              </label>
              <select
                id="data"
                value={form.dataAvailability}
                onChange={(e) => set({ dataAvailability: e.target.value })}
                className="select"
              >
                <option value="available-on-request">Available on reasonable request</option>
                <option value="public-repo">Deposited in a public repository</option>
                <option value="included">All data included in the manuscript</option>
                <option value="restricted">Restricted — explain in the cover letter</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="ethics">
                Ethics approval
              </label>
              <select
                id="ethics"
                value={form.ethicsStatement}
                onChange={(e) => set({ ethicsStatement: e.target.value })}
                className="select"
              >
                <option value="not-required">Not required for this study</option>
                <option value="obtained">Approved — reference number to follow</option>
                <option value="exempt">Exempt from review</option>
              </select>
              <p className="hint">Human subjects, clinical data and animal studies require a named ethics committee.</p>
            </div>

            <div>
              <label className="label" htmlFor="conflicts">
                Competing interests
              </label>
              <textarea
                id="conflicts"
                rows={3}
                value={form.conflicts}
                onChange={(e) => set({ conflicts: e.target.value })}
                placeholder="Declare any financial or non-financial competing interests, or state 'None to declare'."
                className="textarea"
              />
            </div>

            <div>
              <label className="label" htmlFor="suggested">
                Suggested reviewers{' '}
                <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <input
                id="suggested"
                value={form.suggestedReviewers.join(', ')}
                onChange={(e) =>
                  set({ suggestedReviewers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="Separate names with commas"
                className="input"
              />
              <p className="hint">
                Editors are not obliged to use suggested reviewers, particularly where a conflict of interest exists.
              </p>
            </div>
          </div>
        )}

        {/* ══ STEP 5 — Review and submit ══ */}
        {step === 4 && (
          <div className="space-y-5">
            <Note tone="success" icon="checkCircle" title="Ready to submit">
              Review the summary below. Once submitted, the manuscript enters the journal&apos;s editorial workflow and
              you will be notified at each stage.
            </Note>

            <ReviewSection title="Article information" onEdit={() => setStep(0)}>
              <dl className="space-y-2.5 text-[0.875rem]">
                <Row label="Title" value={form.title} />
                <Row label="Type" value={form.articleType} />
                <Row label="Section" value={form.section} />
                <Row label="Keywords" value={form.keywords.join(', ')} />
              </dl>
              <p className="mt-3 border-t border-ink-100 pt-3 text-[0.875rem] leading-relaxed text-ink-700">
                {form.abstract}
              </p>
            </ReviewSection>

            <ReviewSection title="Authors" onEdit={() => setStep(1)}>
              <ol className="space-y-2 text-[0.875rem]">
                {form.authors.map((a, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-xs font-semibold text-ink-400">{i + 1}.</span>
                    <span className="font-medium text-ink-900">{a.name}</span>
                    <span className="text-ink-600">· {a.affiliation}</span>
                    {a.isCorresponding && <span className="chip bg-brand-50 text-brand-700 ring-brand-200">Corresponding</span>}
                  </li>
                ))}
              </ol>
            </ReviewSection>

            <ReviewSection title="Files" onEdit={() => setStep(2)}>
              <ul className="space-y-1.5 text-[0.875rem]">
                {form.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-ink-700">
                    <Icon name="file" size={14} className="shrink-0 text-ink-400" />
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-ink-400">({f.type})</span>
                  </li>
                ))}
              </ul>
            </ReviewSection>

            <ReviewSection title="Additional information" onEdit={() => setStep(3)}>
              <dl className="space-y-2 text-[0.875rem]">
                <Row label="Funding" value={form.funding === 'none' ? 'No funding' : form.fundingStatement} />
                <Row label="Data availability" value={form.dataAvailability.replace(/-/g, ' ')} />
                <Row label="Ethics approval" value={form.ethicsStatement.replace(/-/g, ' ')} />
                <Row label="Competing interests" value={form.conflicts || 'None declared'} />
              </dl>
            </ReviewSection>

            <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3.5">
              <p className="text-[0.8125rem] leading-relaxed text-ink-600">
                By submitting, you confirm that the manuscript is original, is not under consideration elsewhere, and
                that all authors have approved the submission.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-5">
          <button onClick={back} className="btn-secondary" disabled={step === 0}>
            <Icon name="chevronLeft" size={15} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-500">
              Step {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">
                Continue
                <Icon name="chevronRight" size={15} />
              </button>
            ) : (
              <button onClick={submit} className="btn-primary">
                <Icon name="send" size={15} />
                Submit manuscript
              </button>
            )}
          </div>
        </div>
      </Panel>
    </Page>
  )
}

/* ── local presentational helpers ─────────────────────────────────────── */

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase sm:w-40">
        {label}
      </dt>
      <dd className="text-ink-800">{value || '—'}</dd>
    </div>
  )
}

function ReviewSection({ title, children, onEdit }) {
  return (
    <div className="rounded-xl border border-ink-200">
      <div className="flex items-center justify-between gap-2 border-b border-ink-200 bg-ink-50/60 px-4 py-2.5">
        <h3 className="text-[0.8125rem] font-semibold text-ink-900">{title}</h3>
        <button onClick={onEdit} className="btn-ghost btn-sm">
          <Icon name="edit" size={13} />
          Edit
        </button>
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  )
}
