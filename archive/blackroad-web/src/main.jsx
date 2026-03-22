import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)', marginBottom: 20, maxWidth: 120, margin: '0 auto 20px' }} />
            <h1 style={{ color: '#f5f5f5', fontSize: 32, margin: '0 0 16px' }}>Something went wrong</h1>
            <p style={{ color: '#f5f5f5', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '10px 24px', background: 'transparent', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
