import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/supabase";

type LeaderboardModalProps = {
    isOpen: boolean;
    mode: string;
    onClose: () => void;
};

type ScoreRow = { name: string; score: number };

export default function LeaderboardModal({
    isOpen,
    mode,
    onClose,
}: LeaderboardModalProps) {
    const [scores, setScores] = useState<ScoreRow[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchLeaderboard(mode)
                .then(setScores)
                .catch(console.error);
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1e1e1e',
                color: '#eee',
                borderRadius: 8,
                width: '90%',
                maxWidth: 500,
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#1e1e1e',
                    zIndex: 10,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #444',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} Leaderboard
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            color: '#ff4d4f',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            lineHeight: 1,
                            marginLeft: 'auto',
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <ol style={{
                    padding: '1rem',
                    margin: 0,
                    listStyle: 'none',
                }}>
                    {scores.map((entry, i) => (
                        <li key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #444',
                            padding: '4px 0'
                        }}>
                            <span>{i + 1}. {entry.name}</span>
                            <span>{entry.score}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
