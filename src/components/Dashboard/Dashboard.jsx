import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { scoreMatch } from '../../utils/groq'
import MatchCard from './MatchCard'

export default function Dashboard() {
  const [currentUserProfile, setCurrentUserProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Get current user's profile
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found - redirect to onboarding
          navigate('/onboarding')
          return
        }
        throw profileError
      }

      setCurrentUserProfile(currentProfile)

      // Get all other profiles
      const { data: otherProfiles, error: othersError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)

      if (othersError) throw othersError

      if (!otherProfiles || otherProfiles.length === 0) {
        setMatches([])
        setLoading(false)
        return
      }

      // Score each match using AI
      console.log(`Scoring ${otherProfiles.length} potential matches...`)

      const scoredMatches = []
      for (const profile of otherProfiles) {
        try {
          const { score, explanation } = await scoreMatch(currentProfile, profile)
          scoredMatches.push({
            ...profile,
            score,
            explanation,
          })
          console.log(`Scored ${profile.name}: ${score}`)
        } catch (err) {
          console.error(`Error scoring ${profile.name}:`, err)
          // Add with default score if scoring fails
          scoredMatches.push({
            ...profile,
            score: 50,
            explanation: 'Unable to generate match score at this time.',
          })
        }
      }

      // Sort by score (highest first)
      scoredMatches.sort((a, b) => b.score - a.score)

      setMatches(scoredMatches)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Finding your matches...</h2>
        <p style={{ color: '#666' }}>This may take a moment</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2 style={{ color: '#c62828' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={loadMatches}
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
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>Your Matches</h1>
          {currentUserProfile && (
            <p style={{ margin: 0, color: '#666' }}>
              Welcome back, {currentUserProfile.name}!
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/messages')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Messages
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Match count */}
      {matches.length > 0 && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Found {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </p>
      )}

      {/* Matches list */}
      {matches.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <h3>No matches yet</h3>
          <p style={{ color: '#666' }}>
            Check back later as more people join the network!
          </p>
        </div>
      ) : (
        <div>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}
