import { useState } from 'react'

const questions = [
  {
    id: 'working_style',
    question: 'What is your preferred working style?',
    options: ['Remote', 'Hybrid', 'In-person', 'Flexible'],
  },
  {
    id: 'collaboration',
    question: 'What is your collaboration preference?',
    options: ['Lead projects', 'Equal partnership', 'Support role', 'Solo with check-ins'],
  },
  {
    id: 'goal',
    question: 'What is your primary goal?',
    options: ['Build a startup', 'Freelance projects', 'Learn & grow', 'Stable income'],
  },
  {
    id: 'availability',
    question: 'What is your availability?',
    options: ['Full-time', 'Part-time', 'Weekends only', 'Flexible hours'],
  },
  {
    id: 'passion',
    question: 'What is your passion area?',
    options: ['Tech/Engineering', 'Design/Creative', 'Business/Marketing', 'Social Impact', 'Other'],
  },
]

export default function IkigaiQuiz({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  const handleAnswer = (answer) => {
    const questionId = questions[currentQuestion].id
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)

    // Move to next question or complete
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete
      onComplete(newAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Ikigai Assessment</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Answer 5 quick questions to help us find your perfect match
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: '30px' }}>
        <div
          style={{
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>{question.question}</h2>

      {/* Options */}
      <div style={{ marginBottom: '30px' }}>
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            style={{
              display: 'block',
              width: '100%',
              padding: '15px',
              marginBottom: '10px',
              fontSize: '16px',
              backgroundColor: answers[question.id] === option ? '#4CAF50' : '#f5f5f5',
              color: answers[question.id] === option ? 'white' : '#333',
              border: '2px solid',
              borderColor: answers[question.id] === option ? '#4CAF50' : '#ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (answers[question.id] !== option) {
                e.target.style.backgroundColor = '#e8e8e8'
              }
            }}
            onMouseLeave={(e) => {
              if (answers[question.id] !== option) {
                e.target.style.backgroundColor = '#f5f5f5'
              }
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Back button */}
      {currentQuestion > 0 && (
        <button
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#fff',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      )}
    </div>
  )
}
