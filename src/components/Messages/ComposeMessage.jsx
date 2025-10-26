import { useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function ComposeMessage({ recipientId, recipientName, onClose, onSent }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setSending(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to send messages')

      // Generate a thread ID (using a simple combination of user IDs, sorted)
      const threadId = [user.id, recipientId].sort().join('_')

      // Insert message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          recipient_id: recipientId,
          message_text: message.trim(),
        })

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(insertError.message || 'Failed to send message')
      }

      // Success
      onSent()
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 10px 0' }}>Send Message</h2>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          To: {recipientName}
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={6}
          autoFocus
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            resize: 'vertical',
            marginBottom: '15px',
          }}
        />

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={sending}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: sending ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
