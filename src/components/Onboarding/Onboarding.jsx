import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import ResumeUpload from './ResumeUpload'
import ProfileForm from './ProfileForm'
import IkigaiQuiz from './IkigaiQuiz'

export default function Onboarding() {
  const [step, setStep] = useState(1) // 1: Resume, 2: Profile, 3: Ikigai
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleProfileExtracted = (data) => {
    setProfileData(data)
    setStep(2)
  }

  const handleProfileSubmit = (data) => {
    setProfileData(data)
    setStep(3)
  }

  const handleIkigaiComplete = async (ikigaiAnswers) => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to complete onboarding')
      }

      // Save profile to database
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          headline: profileData.headline,
          skills: profileData.skills,
          experience_summary: profileData.experience_summary,
          interests: profileData.interests,
          linkedin_link: profileData.linkedin_link,
          ikigai_answers: ikigaiAnswers,
        })

      if (insertError) throw insertError

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Saving your profile...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2 style={{ color: '#c62828' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
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
    <>
      {step === 1 && <ResumeUpload onProfileExtracted={handleProfileExtracted} />}
      {step === 2 && <ProfileForm initialData={profileData} onSubmit={handleProfileSubmit} />}
      {step === 3 && <IkigaiQuiz onComplete={handleIkigaiComplete} />}
    </>
  )
}
