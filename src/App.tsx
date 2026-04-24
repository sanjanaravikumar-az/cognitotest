import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { TokenDisplay } from './components/TokenDisplay'
import { AuthInfo } from './components/AuthInfo'
import './App.css'

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          <header className="app-header">
            <h1>Cognito User Pool Auth Demo</h1>
            <p className="subtitle">
              Gen1 Amplify — <code>userPoolOnly</code> configuration (no Identity Pool)
            </p>
            <button type="button" className="sign-out-btn" onClick={signOut}>
              Sign Out
            </button>
          </header>

          <main className="app-main">
            <AuthInfo user={user} />
            <TokenDisplay />
          </main>

          <footer className="app-footer">
            <p>
              This app uses a Cognito User Pool authorizer with JWT tokens.
              No Identity Pool. No IAM credentials. Pure <code>userPoolOnly</code> auth.
            </p>
          </footer>
        </div>
      )}
    </Authenticator>
  )
}

export default App
