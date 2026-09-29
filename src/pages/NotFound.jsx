import { Link } from 'react-router-dom'
import { Page, Panel, EmptyState } from '../components/ui/primitives'

export default function NotFound() {
  return (
    <Page>
      <Panel bodyClassName="p-0">
        <EmptyState
          icon="search"
          title="Page not found"
          description="The page you were looking for does not exist, or you may not have access to it in this role."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link to="/" className="btn-primary">
                Go to dashboard
              </Link>
              <Link to="/submissions" className="btn-secondary">
                Browse submissions
              </Link>
              <Link to="/help" className="btn-secondary">
                Help
              </Link>
            </div>
          }
        />
      </Panel>
    </Page>
  )
}
