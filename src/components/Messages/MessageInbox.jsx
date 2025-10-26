import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function MessageInbox() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadThreads()
  }, [])

  const loadThreads = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Get all messages where user is sender or recipient
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      // Group messages by thread_id
      const threadsMap = {}
      for (const msg of messages) {
        if (!threadsMap[msg.thread_id]) {
          threadsMap[msg.thread_id] = {
            thread_id: msg.thread_id,
            messages: [],
            other_user_id: msg.sender_id === user.id ? msg.recipient_id : msg.sender_id,
          }
        }
        threadsMap[msg.thread_id].messages.push(msg)
      }

      // Convert to array and get the latest message for each thread
      const threadsArray = Object.values(threadsMap).map(thread => ({
        ...thread,
        latest_message: thread.messages[0], // Already sorted by created_at desc
        message_count: thread.messages.length,
      }))

      // Get profiles for all other users
      const otherUserIds = [...new Set(threadsArray.map(t => t.other_user_id))]
      if (otherUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, headline')
          .in('user_id', otherUserIds)

        if (profilesError) throw profilesError

        // Map profiles to threads
        const profilesMap = {}
        profiles.forEach(p => {
          profilesMap[p.user_id] = p
        })

        threadsArray.forEach(thread => {
          thread.other_user_profile = profilesMap[thread.other_user_id]
        })
      }

      setThreads(threadsArray)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Loading messages...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2 style={{ color: '#c62828' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={loadThreads}
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Messages</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fff',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Threads list */}
      {threads.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <h3>No messages yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Start a conversation by sending a message to one of your matches!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            View Matches
          </button>
        </div>
      ) : (
        <div>
          {threads.map((thread) => (
            <div
              key={thread.thread_id}
              onClick={() => navigate(`/messages/${thread.thread_id}`)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '15px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                    {thread.other_user_profile?.name || 'Unknown User'}
                  </h3>
                  {thread.other_user_profile?.headline && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                      {thread.other_user_profile.headline}
                    </p>
                  )}
                  <p style={{
                    margin: 0,
                    color: '#555',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {thread.latest_message.message_text}
                  </p>
                </div>
                <div style={{ marginLeft: '20px', textAlign: 'right' }}>
                  <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                    {formatTime(thread.latest_message.created_at)}
                  </p>
                  {thread.message_count > 1 && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {thread.message_count} messages
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
