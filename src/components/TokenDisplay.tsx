import { useState, useEffect } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

interface DecodedToken {
  header: Record<string, unknown>
  payload: Record<string, unknown>
}

function decodeJwt(token: string): DecodedToken | null {
  try {
    const [headerB64, payloadB64] = token.split('.')
    return {
      header: JSON.parse(atob(headerB64)),
      payload: JSON.parse(atob(payloadB64)),
    }
  } catch {
    return null
  }
}

type TabId = 'idToken' | 'accessToken' | 'session'

export function TokenDisplay() {
  const [activeTab, setActiveTab] = useState<TabId>('idToken')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTokens() {
      try {
        const session = await fetchAuthSession()
        const idJwt = session.tokens?.idToken?.toString() ?? null
        const accessJwt = session.tokens?.accessToken?.toString() ?? null

        setIdToken(idJwt)
        setAccessToken(accessJwt)
        setSessionInfo({
          hasCredentials: !!session.credentials,
          hasIdentityId: !!session.identityId,
          identityId: session.identityId ?? 'None (no Identity Pool)',
          userSub: session.userSub,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session')
      }
    }
    loadTokens()
  }, [])

  if (error) {
    return (
      <section className="card error-card">
        <h2>Session Error</h2>
        <p>{error}</p>
      </section>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'idToken', label: 'ID Token' },
    { id: 'accessToken', label: 'Access Token' },
    { id: 'session', label: 'Session Info' },
  ]

  return (
    <section className="card token-display">
      <h2>Auth Tokens</h2>
      <p className="token-note">
        These are JWT tokens issued by the Cognito User Pool. In a <code>userPoolOnly</code> setup,
        there are no IAM credentials or Identity Pool IDs.
      </p>

      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content" role="tabpanel">
        {activeTab === 'idToken' && <TokenPanel token={idToken} label="ID Token" />}
        {activeTab === 'accessToken' && <TokenPanel token={accessToken} label="Access Token" />}
        {activeTab === 'session' && <SessionPanel info={sessionInfo} />}
      </div>
    </section>
  )
}


function TokenPanel({ token, label }: { token: string | null; label: string }) {
  const [showRaw, setShowRaw] = useState(false)
  const decoded = token ? decodeJwt(token) : null

  if (!token) {
    return <p className="loading">Loading {label}...</p>
  }

  return (
    <div className="token-panel">
      <div className="panel-header">
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? 'Show Decoded' : 'Show Raw JWT'}
        </button>
      </div>

      {showRaw ? (
        <pre className="token-raw">{token}</pre>
      ) : (
        decoded && (
          <div className="token-decoded">
            <h3>Header</h3>
            <pre>{JSON.stringify(decoded.header, null, 2)}</pre>
            <h3>Payload</h3>
            <pre>{JSON.stringify(decoded.payload, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  )
}

function SessionPanel({ info }: { info: Record<string, unknown> | null }) {
  if (!info) {
    return <p className="loading">Loading session info...</p>
  }

  return (
    <div className="session-panel">
      <div className="session-grid">
        {Object.entries(info).map(([key, value]) => (
          <div key={key} className="session-item">
            <span className="label">{key}</span>
            <span className={`value ${key === 'identityId' && value === 'None (no Identity Pool)' ? 'highlight-warn' : ''}`}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>
      <div className="session-note">
        <p>
          Notice: <code>hasCredentials</code> and <code>hasIdentityId</code> should
          be <code>false</code> — this confirms no Identity Pool is involved.
          Auth is purely JWT-based via the User Pool.
        </p>
      </div>
    </div>
  )
}
