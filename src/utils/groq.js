const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function callGroqAPI(prompt, systemPrompt = 'You are a helpful assistant.', maxTokens = 1024) {
  if (!GROQ_API_KEY) {
    throw new Error('Missing Groq API key. Check your .env file.')
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', // GPT OSS model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling Groq API:', error)
    throw error
  }
}

// Helper to truncate text to fit token limits
// Rough estimate: 1 token ≈ 4 characters
function truncateText(text, maxChars = 15000) {
  if (text.length <= maxChars) {
    return text
  }
  console.log(`Truncating resume from ${text.length} to ${maxChars} characters`)
  return text.substring(0, maxChars) + '...'
}

// Helper to extract profile data from resume text
export async function extractProfileFromResume(resumeText) {
  // Truncate resume text to fit within token limits
  const truncatedText = truncateText(resumeText, 15000)

  const prompt = `Extract profile data from this resume and return ONLY valid JSON (no markdown, no extra text):
{
  "name": "",
  "headline": "",
  "skills": [],
  "experience_summary": "",
  "interests": [],
  "linkedin_link": ""
}

Resume text:
${truncatedText}

Return only the JSON object, nothing else. For linkedin_link, extract any LinkedIn URL found in the resume.`

  const systemPrompt = 'You are a resume parser that extracts structured data. Return only valid JSON without markdown code blocks.'

  try {
    const response = await callGroqAPI(prompt, systemPrompt, 1500)
    console.log('Raw API response:', response)

    // Clean up response - remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '')
    }

    console.log('Cleaned response:', cleaned)

    return JSON.parse(cleaned)
  } catch (error) {
    console.error('Error parsing resume:', error)
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON received from API. Check the raw response above.')
    }
    throw new Error('Failed to extract profile data from resume')
  }
}

// Helper to score matches
export async function scoreMatch(currentUser, matchUser) {
  const prompt = `Score this match from 0-100 and explain why in 2-3 sentences.

Current User:
- Skills: ${currentUser.skills?.join(', ') || 'N/A'}
- Experience: ${currentUser.experience_summary || 'N/A'}
- Interests: ${currentUser.interests?.join(', ') || 'N/A'}
- Working style: ${currentUser.ikigai_answers?.working_style || 'N/A'}
- Collaboration: ${currentUser.ikigai_answers?.collaboration || 'N/A'}
- Goal: ${currentUser.ikigai_answers?.goal || 'N/A'}

Match Candidate:
- Name: ${matchUser.name}
- Skills: ${matchUser.skills?.join(', ') || 'N/A'}
- Experience: ${matchUser.experience_summary || 'N/A'}
- Interests: ${matchUser.interests?.join(', ') || 'N/A'}
- Working style: ${matchUser.ikigai_answers?.working_style || 'N/A'}
- Collaboration: ${matchUser.ikigai_answers?.collaboration || 'N/A'}
- Goal: ${matchUser.ikigai_answers?.goal || 'N/A'}

Return ONLY valid JSON (no markdown):
{
  "score": 85,
  "explanation": "Strong overlap in skills and goals..."
}`

  const systemPrompt = 'You are a professional matchmaking AI. Return only valid JSON without markdown code blocks.'

  try {
    const response = await callGroqAPI(prompt, systemPrompt, 1024)
    console.log('Match scoring - Raw response:', response)

    // Clean up response
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '')
    }

    console.log('Match scoring - Cleaned response:', cleaned)

    const parsed = JSON.parse(cleaned)
    console.log('Match scoring - Parsed result:', parsed)
    return parsed
  } catch (error) {
    console.error('Error scoring match:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    // Return default score on error
    return {
      score: 50,
      explanation: 'Unable to generate match score at this time.'
    }
  }
}
