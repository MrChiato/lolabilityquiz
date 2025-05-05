import { useState, useEffect } from 'react';
import { Mode } from './IconQuiz';

type NameModalProps = {
    isOpen: boolean;
    initialName?: string;
    title?: string;
    score: number;
    mode: Mode | null;
    onSubmit: (name: string) => void;
    onClose: () => void;
};

export default function NameModal({
    isOpen,
    initialName = '',
    title = 'Game Over',
    score,
    mode,
    onSubmit,
    onClose,
}: NameModalProps) {
    const [name, setName] = useState(initialName);

    const tweetText = encodeURIComponent(
        `I just got ${score} points in the LoL Abilites Quiz ${mode ? `on ${mode} difficulty` : ''}!`
    );
    const quizUrl = encodeURIComponent('https://www.lolabilityquiz.com/');

    useEffect(() => {
        if (isOpen) setName(initialName);
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1e1e1e',
                color: '#eee',
                padding: '2rem',
                borderRadius: 8,
                width: '90%',
                maxWidth: 360,
                textAlign: 'center',
                position: 'relative',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'transparent',
                        border: 'none',
                        fontSize: 20,
                        color: '#ff4d4f',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
                <p style={{ marginBottom: '1rem' }}>You got a new record of <b>{score}</b> on <i>{mode}</i> mode!</p>
                <p style={{ marginBottom: '1rem' }}>Enter a name for the leaderboard:</p>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                        width: '80%',
                        padding: '0.5rem',
                        fontSize: '1rem',
                        borderRadius: 4,
                        border: '1px solid #444',
                        marginBottom: '1rem',
                        backgroundColor: '#121212',
                        color: '#eee',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <button
                        onClick={() => onSubmit(name.trim())}
                        disabled={!name.trim()}
                        style={{
                            padding: '0.5rem 1rem',
                            width: '40%',
                            fontSize: '1rem',
                            borderRadius: 4,
                            border: 'none',
                            backgroundColor: name.trim() ? '#28a745' : '#555',
                            color: '#fff',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Submit
                    </button>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${quizUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            width: '40%',
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#1DA1F2',
                            color: '#fff',
                            borderRadius: 4,
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0d95e8')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1DA1F2')}
                    >
                        Share on Twitter
                    </a>
                </div>
            </div>
        </div>
    );
}
