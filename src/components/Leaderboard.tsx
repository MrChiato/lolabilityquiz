import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../lib/supabase';
import LeaderboardModal from './LeaderboardModal';

const MODES = ['easy', 'medium', 'hard'] as const;

type ScoreRow = { name: string; score: number };

export default function Leaderboards() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<typeof MODES[number] | null>(null);

    return (
        <>
            <div className="leaderboards">
                {MODES.map((mode) => (
                    <ModeBoard
                        key={mode}
                        mode={mode}
                        onExpand={() => {
                            setModalMode(mode);
                            setModalOpen(true);
                        }}
                    />
                ))}
            </div>

            {modalMode && (
                <LeaderboardModal
                    isOpen={modalOpen}
                    mode={modalMode}
                    onClose={() => {
                        setModalOpen(false);
                        setModalMode(null);
                    }}
                />
            )}
        </>
    );
}

function ModeBoard({
    mode,
    onExpand,
}: {
    mode: typeof MODES[number];
    onExpand: () => void;
}) {
    const [board, setBoard] = useState<ScoreRow[]>([]);

    useEffect(() => {
        fetchLeaderboard(mode, 10)
            .then(setBoard)
            .catch(console.error);
    }, [mode]);

    return (
        <div className="modeBoard">
            <h2
                style={{
                    textAlign: 'center',
                    margin: '0 0 12px',
                    color: '#FFC946',
                    textTransform: 'capitalize',
                }}
            >
                {mode} Mode
            </h2>
            <ol
                style={{
                    padding: 0,
                    margin: 0,
                    listStyle: 'none',
                    color: '#eee',
                }}
            >
                {board.map((row, i) => (
                    <li
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            fontSize: 16,
                            borderBottom: '1px solid #333',
                        }}
                    >
                        <span>{i + 1}. {row.name}</span>
                        <span>{row.score}</span>
                    </li>
                ))}
            </ol>

            <button
                onClick={onExpand}
                style={{
                    marginTop: 8,
                    background: 'none',
                    border: 'none',
                    color: '#00bcd4',
                    cursor: 'pointer',
                    fontSize: 14,
                    textDecoration: 'underline',
                }}
            >
                See Full Leaderboard
            </button>
        </div>
    );
}

