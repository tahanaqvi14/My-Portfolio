import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { emailjsConfig } from '../data/content'
import Magnetic from './Magnetic'

const MAX = 500

export default function ContactForm({ onSent }) {
  const formRef = useRef(null)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      await emailjs.sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, formRef.current, {
        publicKey: emailjsConfig.publicKey,
      })
      setStatus('sent')
      setMessage('')
      onSent?.()
    } catch (error) {
      console.error('Email send failed:', error?.status ?? '', error?.text ?? error)
      setStatus('error')
    }
  }

  const disabled = status === 'sending' || !message.trim()
  const label = { idle: 'Send', error: 'Retry', sending: 'Sending', sent: 'Sent' }[status]

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col">
      <div className="flex items-baseline justify-between">
        <label htmlFor="message" className="mono text-dim">
          Your message
        </label>
        <span className="mono tabular-nums text-dim">
          {message.length}/{MAX}
        </span>
      </div>

      <textarea
        id="message"
        name="message"
        required
        maxLength={MAX}
        rows={4}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          if (status === 'error' || status === 'sent') setStatus('idle')
        }}
        placeholder="Got a thought? I'd love to hear it."
        className="field mt-3"
      />

      <div className="mt-8 flex items-center justify-between gap-6">
        <p className="max-w-[26ch] text-[0.95rem] leading-snug text-body" role="status" aria-live="polite">
          {status === 'sent' && 'Thanks for reaching out — your message is on its way.'}
          {status === 'error' && 'Something went wrong. Please try again, or reach me on LinkedIn.'}
          {(status === 'idle' || status === 'sending') && 'It lands straight in my inbox.'}
        </p>

        <Magnetic strength={0.3}>
          <button
            type="submit"
            disabled={disabled}
            aria-label={status === 'sending' ? 'Sending message' : 'Send message'}
            className="send group"
          >
            <span className="flex flex-col items-center gap-1">
              {status === 'sending' ? (
                <span className="size-5 animate-spin rounded-full border-2 border-bg/30 border-t-bg" aria-hidden="true" />
              ) : (
                <span aria-hidden="true" className="send-arrow">
                  {status === 'sent' ? '✓' : '↗'}
                </span>
              )}
              <span className="mono">{label}</span>
            </span>
          </button>
        </Magnetic>
      </div>
    </form>
  )
}
