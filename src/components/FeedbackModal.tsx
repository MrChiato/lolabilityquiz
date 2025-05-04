import { useState } from 'react'

interface Props {
    onClose(): void
    onSubmit(feedback: string): Promise<void> | void
}

export default function FeedbackModal({ onClose, onSubmit }: Props) {
    const [text, setText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) {
            setError('Please enter some feedback.')
            return
        }
        setSubmitting(true)
        try {
            await onSubmit(text.trim())
        } catch (err: any) {
            console.error(err)
            setError('Submission failed, please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    background: '#1e1e1e',
                    padding: 24,
                    borderRadius: 8,
                    width: '90%',
                    maxWidth: 400,
                    color: '#eee',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <h2 style={{ margin: 0 }}>I’d love your feedback!</h2>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={6}
                    placeholder="What could I improve or add?"
                    style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #444',
                        background: '#121212',
                        color: '#eee',
                        fontSize: 14,
                        resize: 'vertical',
                    }}
                />
                {error && <p style={{ color: 'salmon', margin: 0 }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#444',
                            color: '#eee',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        {submitting ? 'Sending…' : 'Send Feedback'}
                    </button>
                </div>
            </form>
        </div>
    )
}
