import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        SuperNetworkAI
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '40px', color: '#666' }}>
        Find your perfect co-founder, teammate, or client using AI-powered matching
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link
          to="/signup"
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Get Started
        </Link>
        <Link
          to="/login"
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Log In
        </Link>
      </div>

      <div style={{ marginTop: '60px', maxWidth: '800px', margin: '60px auto 0' }}>
        <h2>How it works</h2>
        <div style={{ display: 'flex', gap: '30px', marginTop: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3>1. Upload Resume</h3>
            <p>AI extracts your skills and experience automatically</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3>2. Answer 5 Questions</h3>
            <p>Quick Ikigai assessment to understand your goals</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3>3. Get Matched</h3>
            <p>See ranked connections with AI explanations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
