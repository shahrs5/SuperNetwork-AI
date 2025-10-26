import { useNavigate } from 'react-router-dom'

export default function MatchCard({ match }) {
  const navigate = useNavigate()

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50' // Green
    if (score >= 60) return '#FF9800' // Orange
    return '#9E9E9E' // Gray
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#fff',
      }}
      onClick={() => navigate(`/profile/${match.user_id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>
            {match.name}
          </h3>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
            {match.headline}
          </p>

          {/* Skills preview */}
          {match.skills && match.skills.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              {match.skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#e3f2fd',
                    color: '#1565c0',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    marginRight: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {skill}
                </span>
              ))}
              {match.skills.length > 5 && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  +{match.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* AI explanation */}
          <p style={{ margin: '0', color: '#555', fontSize: '14px', fontStyle: 'italic' }}>
            "{match.explanation}"
          </p>
        </div>

        {/* Match score */}
        <div
          style={{
            marginLeft: '20px',
            textAlign: 'center',
            minWidth: '80px',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: getScoreColor(match.score),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {match.score}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
            Match
          </p>
        </div>
      </div>
    </div>
  )
}
