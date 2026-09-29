/**
 * Application routes.
 *
 * Two shells exist: the authenticated editorial application (AppShell) and a
 * chrome-free public shell (PublicLayout) used for the reader-facing article
 * page, so published articles look like a journal website rather than an
 * administrative screen.
 *
 * Routing uses HashRouter so the app works on GitHub Pages, which serves the
 * site as static files and cannot rewrite deep links like /submissions/123 to
 * index.html. URLs therefore take the form /#/submissions/123.
 *
 * @module App
 */

import { HashRouter, Route, Routes } from 'react-router-dom'

import AppShell from './layouts/AppShell'
import PublicLayout from './layouts/PublicLayout'

import Dashboard from './pages/Dashboard'
import Submissions from './pages/Submissions'
import SubmissionDetail from './pages/SubmissionDetail'
import NewSubmission from './pages/NewSubmission'
import MySubmissions from './pages/MySubmissions'
import Reviews from './pages/Reviews'
import MyReviews from './pages/MyReviews'
import ReviewerDetail from './pages/ReviewerDetail'
import Publications from './pages/Publications'
import PublicArticle from './pages/PublicArticle'
import Issues from './pages/Issues'
import IssueDetail from './pages/IssueDetail'
import Authors from './pages/Authors'
import Users from './pages/Users'
import JournalSettings from './pages/JournalSettings'
import Help from './pages/Help'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public, reader-facing article view */}
        <Route element={<PublicLayout />}>
          <Route path="/publications/:id" element={<PublicArticle />} />
        </Route>

        {/* Editorial application */}
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />

          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="submissions/new" element={<NewSubmission />} />
          <Route path="my-submissions" element={<MySubmissions />} />

          <Route path="reviews" element={<Reviews />} />
          <Route path="my-reviews" element={<MyReviews />} />
          <Route path="reviewers" element={<Reviews />} />
          <Route path="reviewers/:id" element={<ReviewerDetail />} />

          <Route path="publications" element={<Publications />} />
          <Route path="issues" element={<Issues />} />
          <Route path="issues/:id" element={<IssueDetail />} />
          <Route path="authors" element={<Authors />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<JournalSettings />} />
          <Route path="help" element={<Help />} />
          <Route path="profile" element={<Users />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
