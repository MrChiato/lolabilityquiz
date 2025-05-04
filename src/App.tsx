import { useState } from 'react';
import IconQuiz from './components/IconQuiz';
import Leaderboards from './components/Leaderboard';
import NameModal from './components/NameModal';
import DataPage from './pages/DataPage';
import { fetchLeaderboard, recordFeedback, submitScore } from './lib/supabase';
import { Routes, Route, NavLink } from 'react-router-dom'
import AdminPage from './pages/AdminPage';
import FeedbackModal from './components/FeedbackModal';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const [quizKey, setQuizKey] = useState(0);
  const [quizMode, setQuizMode] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isFeedbackOpen, setFeedbackOpen] = useState(false)
  const [gameOverInfo, setGameOverInfo] = useState<{
    finalScore: number;
    bestScore: number;
    mode: 'easy' | 'medium' | 'hard';
  } | null>(null);

  const bumpQuizKey = () => setQuizKey((k) => k + 1);

  const handleGameOver = (
    finalScore: number,
    mode: 'easy' | 'medium' | 'hard'
  ) => {
    setQuizMode(mode);
    const keyScore = `lolQuizHighScorev2_${mode}`;
    const stored = parseInt(localStorage.getItem(keyScore) || '0', 10);
    if (finalScore > stored) {
      setPendingScore(finalScore);
      setModalOpen(true);
    } else {
      setGameOverInfo({ finalScore, bestScore: stored, mode });
    }
  };

  const handleModalSubmit = async (name: string) => {
    const keyScore = `lolQuizHighScorev2_${quizMode}`;
    const keyName = `lolQuizPlayerNamev2_${quizMode}`;
    localStorage.setItem(keyScore, pendingScore.toString());
    localStorage.setItem(keyName, name);
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    try {
      await submitScore(clean, pendingScore, quizMode);
      await fetchLeaderboard(quizMode);
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const buttonStyle: React.CSSProperties = {
    margin: '0 4px',
    padding: '8px 16px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#444',
    color: '#eee',
    textDecoration: 'none',
    transition: 'background-color 0.2s, opacity 0.2s',
  };

  const activeStyle: React.CSSProperties = {
    backgroundColor: '#666',
    opacity: 0.6,
    cursor: 'default',
    pointerEvents: 'none',
  };

  return (
    <div style={{
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      backgroundColor: '#121212',
      color: '#eee',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      <nav style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <NavLink
          to="/"
          end
          style={({ isActive }) =>
            isActive ? { ...buttonStyle, ...activeStyle } : buttonStyle
          }
        >
          Quiz
        </NavLink>

        <NavLink
          to="/leaderboard"
          style={({ isActive }) =>
            isActive ? { ...buttonStyle, ...activeStyle } : buttonStyle
          }
        >
          Leaderboard
        </NavLink>

        <NavLink
          to="/data"
          style={({ isActive }) =>
            isActive ? { ...buttonStyle, ...activeStyle } : buttonStyle
          }
        >
          Data
        </NavLink>
      </nav>

      <nav style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, opacity: 0 }}>
        <NavLink
          to="/admin"
          end
          style={() => buttonStyle}
        >
        </NavLink>
      </nav>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
        overflow: 'auto',
      }}>

        <Routes>
          <Route path="/" element={<IconQuiz onGameOver={handleGameOver} key={quizKey} />} />
          <Route path="/leaderboard" element={<Leaderboards />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      <NameModal
        isOpen={modalOpen}
        initialName={localStorage.getItem(`lolQuizPlayerNamev2_${quizMode}`) || ''}
        title="New High Score!"
        score={pendingScore}
        mode={quizMode}
        onSubmit={handleModalSubmit}
        onClose={() => {
          setModalOpen(false);
          localStorage.setItem(
            `lolQuizHighScorev2_${quizMode}`,
            pendingScore.toString()
          );
          setGameOverInfo({
            finalScore: pendingScore,
            bestScore: pendingScore,
            mode: quizMode,
          });
        }}
      />

      <button
        onClick={() => setFeedbackOpen(true)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          padding: '8px 12px',
          background: '#6D5AF2',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 14,
          zIndex: 1000,
        }}
      >
        Give Feedback
      </button>

      <a
        href="https://buymeacoffee.com/mattiassch"
        target="_blank"
        rel="noopener"
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          padding: '4px 8px',
          background: '#FFDD00',
          color: '#000',
          borderRadius: 4,
          fontSize: 12,
          textDecoration: 'none',
          zIndex: 1000,
        }}
      >
        ☕
      </a>

      {isFeedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSubmit={async (text) => {
            try {
              await recordFeedback(text);
            } catch {
              alert("Could not send feedback.")
            }
            setFeedbackOpen(false);
          }}
        />
      )}

      {gameOverInfo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1e1e1e',
            color: '#eee',
            padding: '2rem',
            borderRadius: 8,
            width: '90%',
            maxWidth: 360,
            textAlign: 'center',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Game Over</h2>
            <p style={{ margin: '0.5rem 0' }}>
              Final score: <strong>{gameOverInfo.finalScore}</strong>
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              Best for <em>{gameOverInfo.mode}</em>: <strong>{gameOverInfo.bestScore}</strong>
            </p>
            <button
              onClick={() => {
                setGameOverInfo(null);
                bumpQuizKey();
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                borderRadius: 4,
                border: 'none',
                backgroundColor: '#28a745',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
