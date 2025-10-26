import { useState } from 'react'

export default function ProfileForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    headline: initialData?.headline || '',
    skills: initialData?.skills?.join(', ') || '',
    experience_summary: initialData?.experience_summary || '',
    interests: initialData?.interests?.join(', ') || '',
    linkedin_link: initialData?.linkedin_link || '',
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Convert comma-separated strings back to arrays
    const profileData = {
      name: formData.name,
      headline: formData.headline,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience_summary: formData.experience_summary,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      linkedin_link: formData.linkedin_link,
    }

    onSubmit(profileData)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto', padding: '20px' }}>
      <h1>Edit Your Profile</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Review and edit the AI-extracted information
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Headline *
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            required
            placeholder="e.g., Full-stack developer looking for co-founder"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Skills (comma-separated) *
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            required
            placeholder="e.g., React, Node.js, Python, AWS"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Experience Summary *
          </label>
          <textarea
            value={formData.experience_summary}
            onChange={(e) => handleChange('experience_summary', e.target.value)}
            required
            rows={4}
            placeholder="Brief summary of your work experience"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Interests (comma-separated)
          </label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => handleChange('interests', e.target.value)}
            placeholder="e.g., Healthcare tech, AI/ML, Remote work"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            LinkedIn Profile URL
          </label>
          <input
            type="url"
            value={formData.linkedin_link}
            onChange={(e) => handleChange('linkedin_link', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Continue to Ikigai Quiz
        </button>
      </form>
    </div>
  )
}
