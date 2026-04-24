import type { AuthUser } from 'aws-amplify/auth'

interface AuthInfoProps {
  user: AuthUser | undefined
}

export function AuthInfo({ user }: AuthInfoProps) {
  return (
    <section className="card auth-info">
      <h2>Authenticated User</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Username</span>
          <span className="value">{user?.username ?? '—'}</span>
        </div>
        <div className="info-item">
          <span className="label">User ID</span>
          <span className="value">{user?.userId ?? '—'}</span>
        </div>
        <div className="info-item">
          <span className="label">Auth Type</span>
          <span className="value highlight">User Pool Only (JWT)</span>
        </div>
        <div className="info-item">
          <span className="label">Identity Pool</span>
          <span className="value highlight-warn">None — not configured</span>
        </div>
      </div>
    </section>
  )
}
