import { useState } from 'react'
import { extractTextFromFile } from '../../utils/resumeParser'
import { extractProfileFromResume } from '../../utils/groq'

export default function ResumeUpload({ onProfileExtracted }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Extract text from file
      const resumeText = await extractTextFromFile(file)

      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error('Could not extract enough text from the file. Please check the file.')
      }

      // Step 2: Use AI to extract profile data
      const profileData = await extractProfileFromResume(resumeText)

      // Step 3: Pass data to parent
      onProfileExtracted(profileData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Upload Your Resume</h1>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        AI will automatically extract your skills, experience, and interests
      </p>
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '30px',
        fontSize: '14px',
        color: '#1565c0'
      }}>
        <strong>💡 Tip:</strong> For best results, go to your LinkedIn profile, click "More" → "Save to PDF" and upload that file, or export your resume as a TXT file.
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          style={{
            display: 'block',
            marginBottom: '15px',
            padding: '10px',
            width: '100%',
            fontSize: '16px',
          }}
        />
        {file && (
          <p style={{ color: '#4CAF50', fontSize: '14px' }}>
            Selected: {file.name}
          </p>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '16px',
          backgroundColor: loading || !file ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading || !file ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Extract Profile Data'}
      </button>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Supported formats: PDF, TXT
      </p>
    </div>
  )
}
