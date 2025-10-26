import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { scoreMatch } from '../../utils/groq'
import ComposeMessage from '../Messages/ComposeMessage'

export default function ProfileDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the profile to view
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)

      // Get current user's profile to calculate match score
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (currentProfile) {
          const { score, explanation } = await scoreMatch(currentProfile, profileData)
          setMatchScore({ score, explanation })
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Loading profile...</h2>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2 style={{ color: '#c62828' }}>Profile not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header with back button */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#fff',
          color: '#666',
          border: '1px solid #ddd',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        ← Back to Matches
      </button>

      {/* Profile card */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '40px',
      }}>
        {/* Name and headline */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{profile.name}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '18px' }}>
            {profile.headline}
          </p>
        </div>

        {/* Match score */}
        {matchScore && (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: matchScore.score >= 80 ? '#4CAF50' : matchScore.score >= 60 ? '#FF9800' : '#9E9E9E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {matchScore.score}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Match Score</h3>
                <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>
                  "{matchScore.explanation}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Skills</h3>
            <div>
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#e3f2fd',
                    color: '#1565c0',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    marginRight: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {profile.experience_summary && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Experience</h3>
            <p style={{ color: '#555', lineHeight: '1.6' }}>
              {profile.experience_summary}
            </p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Interests</h3>
            <p style={{ color: '#555' }}>
              {profile.interests.join(', ')}
            </p>
          </div>
        )}

        {/* Ikigai answers */}
        {profile.ikigai_answers && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Work Preferences</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}>
              {Object.entries(profile.ikigai_answers).map(([key, value]) => (
                <div key={key} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn */}
        {profile.linkedin_link && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>LinkedIn</h3>
            <a
              href={profile.linkedin_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0077b5', textDecoration: 'none' }}
            >
              {profile.linkedin_link}
            </a>
          </div>
        )}

        {/* Send Message button */}
        <button
          onClick={() => setShowMessageModal(true)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Send Message
        </button>
      </div>

      {/* Compose message modal */}
      {showMessageModal && (
        <ComposeMessage
          recipientId={userId}
          recipientName={profile.name}
          onClose={() => setShowMessageModal(false)}
          onSent={() => {
            setShowMessageModal(false)
            navigate('/messages')
          }}
        />
      )}
    </div>
  )
}
