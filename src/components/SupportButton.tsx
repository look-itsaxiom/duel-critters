'use client'

import { useState } from 'react'

export default function SupportButton() {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      setName('')
      setMessage('')
    } catch {
      alert('Something went wrong. Please try again!')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); setSent(false) }}
        className="print:hidden fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full
                   bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white
                   shadow-lg shadow-violet-300 hover:shadow-xl hover:scale-110
                   transition-all duration-200 active:scale-95
                   flex items-center justify-center"
        aria-label="Contact support"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-2.664a46.94 46.94 0 01-2.834-.351C1.453 17.744.113 16.178 0 14.37V6.385c.114-1.866 1.483-3.477 3.405-3.727h1.508z" />
          <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="print:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-pop">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {sent ? 'Message Sent!' : 'Get in Touch'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">&#10004;&#65039;</div>
                <p className="text-gray-600 font-medium">
                  Thanks for reaching out! We&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500
                             text-white font-bold hover:scale-105 transition-transform"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-bold text-gray-600 mb-1">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-800
                               focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100
                               transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-bold text-gray-600 mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={1000}
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-800
                               focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100
                               transition-colors resize-none"
                    placeholder="Questions, feedback, bug reports — anything!"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !name.trim() || !message.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500
                             text-white font-display font-bold text-lg shadow-lg shadow-violet-200
                             hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200 active:scale-[0.98]"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
