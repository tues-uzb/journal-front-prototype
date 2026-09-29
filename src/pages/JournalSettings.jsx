/**
 * Journal settings. Visual only — values are held in the prototype store.
 * @module pages/JournalSettings
 */

import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { canAdminister } from '../domain/roles'

import { Page, PageHeader, Panel, Tabs, Note } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

const SECTIONS = [
  { key: 'general', label: 'General', icon: 'book' },
  { key: 'editorial', label: 'Editorial', icon: 'clipboard' },
  { key: 'publication', label: 'Publication', icon: 'globe' },
  { key: 'appearance', label: 'Appearance', icon: 'settings' },
]

export default function JournalSettings() {
  const settings = useJournalStore((s) => s.settings)
  const updateSettings = useJournalStore((s) => s.updateSettings)
  const { role, pushToast } = useOutletContext()

  const [tab, setTab] = useState('general')
  const [local, setLocal] = useState(settings)

  const canEdit = canAdminister(role)
  const set = (field, value) => setLocal((l) => ({ ...l, [tab]: { ...l[tab], [field]: value } }))

  const save = () => {
    Object.entries(local).forEach(([section, values]) => updateSettings(section, values))
    pushToast({ tone: 'success', title: 'Settings saved', message: 'Journal settings have been updated.' })
  }

  const reset = () => {
    setLocal(settings)
    pushToast({ tone: 'info', title: 'Changes discarded' })
  }

  const dirty = JSON.stringify(local) !== JSON.stringify(settings)

  return (
    <Page className="max-w-5xl">
      <PageHeader
        title="Journal settings"
        description="Configure the journal's identity, editorial process, publication settings and appearance."
        actions={
          canEdit && (
            <>
              <button onClick={reset} className="btn-secondary" disabled={!dirty}>
                Discard
              </button>
              <button onClick={save} className="btn-primary" disabled={!dirty}>
                <Icon name="check" size={15} />
                Save changes
              </button>
            </>
          )
        }
      />

      {!canEdit && (
        <Note tone="info" icon="lock" >
          Settings are read-only outside the Administrator role. Switch roles in the header to make changes.
        </Note>
      )}

      <div className="mt-6">
        <Tabs tabs={SECTIONS} active={tab} onChange={setTab} />
      </div>

      <div className="mt-5 space-y-5">
        {/* ── General ── */}
        {tab === 'general' && (
          <Panel title="Journal identity" bodyClassName="space-y-4 px-5 py-5">
            <Field label="Journal name" id="g-name" value={local.general.name} onChange={(v) => set('name', v)} disabled={!canEdit} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Abbreviation" id="g-abbr" value={local.general.abbreviation} onChange={(v) => set('abbreviation', v)} disabled={!canEdit} hint="Used in citations and page headers." />
              <Field label="Publisher" id="g-pub" value={local.general.publisher} onChange={(v) => set('publisher', v)} disabled={!canEdit} />
            </div>
            <div>
              <label className="label" htmlFor="g-desc">
                Description
              </label>
              <textarea
                id="g-desc"
                rows={4}
                value={local.general.description}
                onChange={(e) => set('description', e.target.value)}
                disabled={!canEdit}
                className="textarea"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ISSN (Print)" id="g-issn1" value={local.general.issnPrint} onChange={(v) => set('issnPrint', v)} disabled={!canEdit} mono />
              <Field label="ISSN (Online)" id="g-issn2" value={local.general.issnOnline} onChange={(v) => set('issnOnline', v)} disabled={!canEdit} mono />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Website" id="g-web" value={local.general.website} onChange={(v) => set('website', v)} disabled={!canEdit} />
              <Field label="Editorial email" id="g-email" value={local.general.email} onChange={(v) => set('email', v)} disabled={!canEdit} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country" id="g-country" value={local.general.country} onChange={(v) => set('country', v)} disabled={!canEdit} />
              <Field label="Timezone" id="g-tz" value={local.general.timezone} onChange={(v) => set('timezone', v)} disabled={!canEdit} />
            </div>
          </Panel>
        )}

        {/* ── Editorial ── */}
        {tab === 'editorial' && (
          <>
            <Panel title="Review model" description="How peer review is conducted." bodyClassName="space-y-4 px-5 py-5">
              <Select
                label="Review model"
                id="e-model"
                value={local.editorial.reviewModel}
                onChange={(v) => set('reviewModel', v)}
                disabled={!canEdit}
                options={['Double-anonymous', 'Single-anonymous', 'Open review']}
                hint="Double-anonymous withholds author and reviewer identities from each other until a decision is made."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Default review deadline"
                  id="e-deadline"
                  value={local.editorial.defaultReviewDeadline}
                  onChange={(v) => set('defaultReviewDeadline', v)}
                  disabled={!canEdit}
                  options={['14 days', '21 days', '28 days', '30 days']}
                />
                <Select
                  label="Reminder interval"
                  id="e-remind"
                  value={local.editorial.reminderInterval}
                  onChange={(v) => set('reminderInterval', v)}
                  disabled={!canEdit}
                  options={['5 days', '7 days', '10 days', '14 days']}
                />
              </div>
            </Panel>

            <Panel title="Editorial workflow" bodyClassName="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Minimum reviews required"
                  id="e-min"
                  value={local.editorial.minReviewersRequired}
                  onChange={(v) => set('minReviewersRequired', v)}
                  disabled={!canEdit}
                  options={['1', '2', '3']}
                />
                <Select
                  label="Maximum reviewers per submission"
                  id="e-max"
                  value={local.editorial.maxReviewersPerSubmission}
                  onChange={(v) => set('maxReviewersPerSubmission', v)}
                  disabled={!canEdit}
                  options={['2', '3', '4', '6']}
                />
              </div>
              <Select
                label="Decision threshold"
                id="e-thresh"
                value={local.editorial.decisionThreshold}
                onChange={(v) => set('decisionThreshold', v)}
                disabled={!canEdit}
                options={['All reviewers recommend', 'Majority of submitted reviews', 'Editor discretion']}
              />
              <Select
                label="Author opt-out from review"
                id="e-optout"
                value={local.editorial.allowAuthorOptOut}
                onChange={(v) => set('allowAuthorOptOut', v)}
                disabled={!canEdit}
                options={['Yes', 'No']}
              />
            </Panel>
          </>
        )}

        {/* ── Publication ── */}
        {tab === 'publication' && (
          <>
            <Panel title="Volume and issue numbering" bodyClassName="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current volume" id="p-vol" value={local.publication.volumeStart} onChange={(v) => set('volumeStart', v)} disabled={!canEdit} />
                <Select
                  label="Issue frequency"
                  id="p-freq"
                  value={local.publication.issueFrequency}
                  onChange={(v) => set('issueFrequency', v)}
                  disabled={!canEdit}
                  options={['Quarterly', 'Biannual', 'Annual', 'Continuous']}
                />
                <Field label="Issues per volume" id="p-per" value={local.publication.issuesPerVolume} onChange={(v) => set('issuesPerVolume', v)} disabled={!canEdit} />
              </div>
            </Panel>

            <Panel title="Identifiers and licensing" bodyClassName="space-y-4 px-5 py-5">
              <Field
                label="DOI prefix"
                id="p-doi"
                value={local.publication.doiPrefix}
                onChange={(v) => set('doiPrefix', v)}
                disabled={!canEdit}
                mono
                hint="Article DOIs are minted as prefix/article-id, e.g. 10.48291/jassd.2026.0118."
              />
              <Select
                label="Licence"
                id="p-lic"
                value={local.publication.licence}
                onChange={(v) => set('licence', v)}
                disabled={!canEdit}
                options={['CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0', 'All rights reserved']}
              />
              <Field
                label="Accepted files"
                id="p-files"
                value={local.publication.acceptedFiles}
                onChange={(v) => set('acceptedFiles', v)}
                disabled={!canEdit}
              />
              <Field
                label="Embargo period"
                id="p-emb"
                value={local.publication.embargoPeriod}
                onChange={(v) => set('embargoPeriod', v)}
                disabled={!canEdit}
              />
            </Panel>

            <Note tone="info" icon="info" title="No DOI registration in this prototype">
              DOIs are displayed as static text. No integration with Crossref or any registration agency is implemented.
            </Note>
          </>
        )}

        {/* ── Appearance ── */}
        {tab === 'appearance' && (
          <Panel title="Public appearance" bodyClassName="space-y-4 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="a-primary">
                  Primary colour
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="a-primary"
                    type="color"
                    value={local.appearance.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    disabled={!canEdit}
                    className="h-9 w-14 cursor-pointer rounded border border-ink-300 bg-white p-1"
                  />
                  <input
                    value={local.appearance.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    disabled={!canEdit}
                    className="input font-mono"
                    aria-label="Primary colour hex value"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="a-accent">
                  Accent colour
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="a-accent"
                    type="color"
                    value={local.appearance.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                    disabled={!canEdit}
                    className="h-9 w-14 cursor-pointer rounded border border-ink-300 bg-white p-1"
                  />
                  <input
                    value={local.appearance.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                    disabled={!canEdit}
                    className="input font-mono"
                    aria-label="Accent colour hex value"
                  />
                </div>
              </div>
            </div>

            <Field label="Logo / wordmark text" id="a-logo" value={local.appearance.logoText} onChange={(v) => set('logoText', v)} disabled={!canEdit} />

            <div>
              <label className="label" htmlFor="a-headline">
                Landing page headline
              </label>
              <input
                id="a-headline"
                value={local.appearance.landingPageHeadline}
                onChange={(e) => set('landingPageHeadline', e.target.value)}
                disabled={!canEdit}
                className="input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Masthead style"
                id="a-mast"
                value={local.appearance.mastheadStyle}
                onChange={(v) => set('mastheadStyle', v)}
                disabled={!canEdit}
                options={['Traditional serif', 'Modern sans-serif']}
              />
              <Select
                label="Show article metrics"
                id="a-metrics"
                value={local.appearance.showMetrics}
                onChange={(v) => set('showMetrics', v)}
                disabled={!canEdit}
                options={['Yes', 'No']}
              />
            </div>

            <Note tone="warning" icon="info">
              Appearance changes are stored locally in this prototype and do not restyle the running interface.
            </Note>
          </Panel>
        )}
      </div>
    </Page>
  )
}

/* ── Field helpers ────────────────────────────────────────────────────── */

function Field({ label, id, value, onChange, disabled, hint, mono }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`input ${mono ? 'font-mono' : ''}`}
      />
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

function Select({ label, id, value, onChange, options, disabled, hint }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="select"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}
