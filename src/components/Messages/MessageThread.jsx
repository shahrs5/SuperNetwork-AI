import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function MessageThread() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [otherUserProfile, setOtherUserProfile] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadThread()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadThread = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setCurrentUserId(user.id)

      // Get all messages in this thread
      const { data: threadMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      if (!threadMessages || threadMessages.length === 0) {
        throw new Error('Thread not found')
      }

      setMessages(threadMessages)

      // Get the other user's ID and profile
      const firstMessage = threadMessages[0]
      const otherUserId = firstMessage.sender_id === user.id ? firstMessage.recipient_id : firstMessage.sender_id

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherUserId)
        .single()

      if (profileError) throw profileError

      setOtherUserProfile(profile)
    } catch (err) {
      console.error('Error loading thread:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !otherUserProfile) return

    setSending(true)

    try {
      // Insert reply
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: currentUserId,
          recipient_id: otherUserProfile.user_id,
          message_text: replyText.trim(),
        })

      if (insertError) throw insertError

      setReplyText('')
    } catch (err) {
      console.error('Error sending reply:', err)
      alert('Failed to send message: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Loading conversation...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2 style={{ color: '#c62828' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/messages')}
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
          Back to Messages
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #ddd',
        paddingBottom: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <button
            onClick={() => navigate('/messages')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: '10px 0 5px 0' }}>{otherUserProfile?.name}</h2>
          {otherUserProfile?.headline && (
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {otherUserProfile.headline}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
        padding: '10px',
      }}>
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.sender_id === currentUserId

          return (
            <div
              key={msg.id || idx}
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: isCurrentUser ? '#4CAF50' : '#f0f0f0',
                  color: isCurrentUser ? 'white' : '#333',
                }}
              >
                <p style={{ margin: '0 0 5px 0', wordWrap: 'break-word' }}>
                  {msg.message_text}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  opacity: 0.7,
                  textAlign: 'right',
                }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      <div style={{
        borderTop: '1px solid #ddd',
        paddingTop: '15px',
        display: 'flex',
        gap: '10px',
      }}>
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !sending) {
              handleSendReply()
            }
          }}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '24px',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSendReply}
          disabled={sending || !replyText.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: sending || !replyText.trim() ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
