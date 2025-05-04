import {
    useState,
    useEffect,
    ChangeEvent,
    KeyboardEvent,
    useRef,
    useMemo,
} from 'react';
import Fuse from 'fuse.js';
import { useAllSpells } from '../hooks/useAllSpells';
import { recordGuessBatch, Guess } from '../lib/supabase'

export type Spell = {
    id: string;
    names: string[];
    iconUrl: string;
    hint: string;
    description: string;
};

type IconQuizProps = {
    onGameOver: (finalScore: number, mode: 'easy' | 'medium' | 'hard') => void
};

export default function IconQuiz({ onGameOver }: IconQuizProps) {
    const [wrongs, setWrongs] = useState<string[]>([]);
    const [usedIcons, setUsedIcons] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(10);
    const [guess, setGuess] = useState('');
    const pendingGuesses = useRef<Guess[]>([])

    const spells = useAllSpells();
    const allNames = useMemo(() => {
        if (!spells) return [];
        return Array.from(new Set(spells.flatMap((s) => s.names))).sort();
    }, [spells]);

    const fuse = useMemo(() => new Fuse(allNames, {
        threshold: 0.4,
        ignoreLocation: true,
        distance: 100,
    }), [allNames]);

    const [availNames, setAvailNames] = useState<string[]>(allNames);

    const [highlighted, setHighlighted] = useState(-1);

    type QuizItem = { spell: Spell; rotation: number }
    const [item, setItem] = useState<QuizItem | null>(null)

    const [lockMode, setLockMode] = useState<'easy' | 'medium' | 'hard' | null>(null);
    const [mode, setMode] = useState<'easy' | 'medium' | 'hard'>('easy');
    const m = lockMode ?? mode;
    const lockIt = () => {
        if (!lockMode) setLockMode(mode);
    };

    const [messages, setMessages] = useState<
        Array<{ id: number; text: string; type: 'correct' | 'wrong' | 'reveal'; x: number }>
    >([]);


    const spawnMessage = (
        text: string,
        type: 'correct' | 'wrong' | 'reveal'
    ) => {
        const id = Date.now() + Math.random();
        const x = Math.random() * 80 - 40;
        setMessages((m) => [...m, { id, text, type, x }]);
        setTimeout(() => {
            setMessages((m) => m.filter((msg) => msg.id !== id));
        }, 3000);
    };

    const listRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
        if (highlighted >= 0 && listRef.current) {
            const el = listRef.current.children[highlighted] as HTMLElement;
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlighted]);

    useEffect(() => {
        if (!spells) return;
        pickNextSpell();
    }, [spells]);

    const pickNextSpell = () => {
        if (!spells) return;
        const remaining = spells.filter((s) => !usedIcons.has(s.iconUrl));
        if (remaining.length === 0) {
            onGameOver(score, lockMode!);
            return;
        }

        const weights = remaining.map(() => 1)

        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let cum = 0;
        let chosenIndex = 0;
        for (let i = 0; i < remaining.length; i++) {
            cum += weights[i];
            if (r <= cum) {
                chosenIndex = i;
                break;
            }
        }
        const choice = remaining[chosenIndex];
        const angle = [0, 90, 180, 270][Math.floor(Math.random() * 4)]

        setItem({ spell: choice, rotation: angle })

        setWrongs([]);
        setUsedIcons((prev) => new Set(prev).add(choice.iconUrl));
        setAvailNames(allNames);
        setGuess('');

        const items = remaining.map((spell, idx) => ({
            spell,
            weight: weights[idx],
            idx,
        }));
        const nextItems = items
            .filter((item) => item.idx !== chosenIndex)
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 2);

        nextItems.forEach(({ spell }) => {
            const img = new Image();
            img.src = spell.iconUrl;
        });
    };

    useEffect(() => {
        if (wrongs.length >= 3 && item) {
            setLives((l) => l - 1);
            spawnMessage(spell.names[0], 'reveal');
            pickNextSpell();
        }
    }, [wrongs, item]);

    useEffect(() => {
        if (lives <= 0 && item) {
            spawnMessage(spell.names[0], 'wrong');
            recordGuessBatch(pendingGuesses.current)
            onGameOver(score, lockMode!);
        }
    }, [lives, item]);

    const makeGuess = (value: string) => {
        if (lives <= 0) return
        if (!lockMode) lockIt();
        if (!item) return;
        const match = spell.names.find(
            (n) => n.toLowerCase() === value.toLowerCase()
        );
        if (match) {
            spawnMessage(spell.names[0], 'correct');
            pendingGuesses.current.push({
                spellname: spell.names[0],
                userguess: value,
                iscorrect: true
            });
            setScore((s) => s + 1);
            pickNextSpell();
        } else {
            spawnMessage(value, 'wrong');
            pendingGuesses.current.push({
                spellname: spell.names[0],
                userguess: value,
                iscorrect: false
            });
            setWrongs((ws) => [...ws, value]);
            setLives((l) => l - 1);
            setAvailNames((a) => a.filter((n) => n !== value));
        }
        setGuess('');
    };

    const onPass = () => {
        if (lives <= 0) return
        if (!lockMode) lockIt();
        if (!item) return;
        setLives((l) => l - 1);
        spawnMessage(spell.names[0], 'reveal');
        pickNextSpell();
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) =>
        setGuess(e.target.value);
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault();
            setHighlighted((h) =>
                suggestions.length === 0 ? -1 : (h + 1) % suggestions.length
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((h) =>
                suggestions.length === 0
                    ? -1
                    : (h - 1 + suggestions.length) % suggestions.length
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlighted >= 0 && highlighted < suggestions.length) {
                makeGuess(suggestions[highlighted]);
            } else if (suggestions.length > 0) {
                makeGuess(suggestions[0]);
            }
        }
    };

    const rawMatches =
        guess.length >= 3
            ? fuse.search(guess).map((r) => r.item)
            : [];

    const suggestions = rawMatches
        .filter((n) => availNames.includes(n))
        .slice(0, 10);

    useEffect(() => {
        setHighlighted(-1);
    }, [suggestions.length]);

    if (spells === null) {
        return <p style={{ color: '#eee', textAlign: 'center' }}>Loading spells…</p>;
    }

    if (!item) return null
    const { spell, rotation } = item
    return (
        <div
            style={{
                fontFamily: '"Segoe UI", Roboto, sans-serif',
                backgroundColor: '#121212',
                color: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                height: '100%',
                padding: 16,
                boxSizing: 'border-box',
                position: 'relative',
            }}
        >
            <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
                <h1 style={{ fontSize: 24, marginBottom: 8 }}>
                    Guess the ability name
                </h1>
                <div style={{ marginBottom: 16 }}>
                    {(['easy', 'medium', 'hard'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => lockMode || setMode(m)}
                            disabled={!!lockMode}
                            style={{
                                padding: '6px 12px',
                                margin: '0 4px',
                                borderRadius: 4,
                                border: m === mode ? '2px solid #FFC946' : '1px solid #444',
                                backgroundColor: m === mode ? '#444' : '#222',
                                color: '#eee',
                                cursor: lockMode ? 'not-allowed' : 'pointer',
                                opacity: lockMode && m !== lockMode ? 0.5 : 1,
                            }}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>
                <h2
                    style={{
                        fontSize: 18,
                        color: '#ccc',
                        marginBottom: 16,
                    }}
                >
                    Score: {score} · Lives: {lives}
                </h2>

                <div style={{ position: 'relative' }}>
                    <img
                        src={spell.iconUrl}
                        alt="Loading"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            width: 96,
                            height: 96,
                            objectFit: 'contain',
                            marginBottom: 16,
                            transform: m !== 'easy' ? `rotate(${rotation}deg)` : undefined,
                            filter: m === 'hard' ? 'grayscale(100%)' : undefined,
                        }}
                    />

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="floatUp"
                            style={{
                                position: 'absolute',
                                left: `calc(50% + ${msg.x}px)`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                fontSize: msg.type === 'reveal' ? 24 : 16,
                                fontWeight: 'bold',
                                color:
                                    msg.type === 'correct'
                                        ? '#4CAF50'
                                        : msg.type === 'wrong'
                                            ? '#E74C3C'
                                            : '#FFA500',
                                animation: 'floatUp 3s ease-out forwards',
                            }}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                <div style={{ minHeight: 48, marginBottom: 16 }}>
                    {wrongs.length >= 1 && (
                        <p style={{ color: '#bbb', fontSize: 16, margin: 0 }}>
                            <strong>Hint:</strong> {spell.hint}
                        </p>
                    )}
                    {wrongs.length >= 2 && (
                        <p
                            style={{
                                color: '#999',
                                fontSize: 14,
                                marginTop: 4,
                            }}
                        >
                            {spell.description}
                        </p>
                    )}
                </div>

                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Type to guess…"
                        value={guess}
                        onChange={onInputChange}
                        onKeyDown={onKeyDown}
                        style={{
                            width: '100%',
                            padding: 12,
                            fontSize: 16,
                            borderRadius: 6,
                            border: '1px solid #444',
                            backgroundColor: '#1e1e1e',
                            color: '#eee',
                            boxSizing: 'border-box',
                        }}
                        autoFocus
                    />
                    {suggestions.length > 0 && (
                        <ul
                            ref={listRef}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                maxHeight: 150,
                                overflowY: 'auto',
                                backgroundColor: '#1e1e1e',
                                border: '1px solid #444',
                                borderTop: 'none',
                                borderRadius: '0 0 6px 6px',
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                zIndex: 10,
                            }}
                        >
                            {suggestions.map((n, i) => (
                                <li
                                    key={n}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => makeGuess(n)}
                                    style={{
                                        padding: '8px',
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        backgroundColor:
                                            i === highlighted ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    }}
                                >
                                    {n}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={onPass}
                    style={{
                        marginBottom: 16,
                        padding: '8px 16px',
                        fontSize: 16,
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#444',
                        color: '#eee',
                        cursor: 'pointer',
                    }}
                >
                    Pass (−1 life)
                </button>
            </div>

            <style>{`
   @keyframes floatUp { 
     from { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
     to   { opacity: 0; transform: translate(-50%, -50%) translateY(-60px); }
   }
   .floatUp {
     animation: floatUp 3s ease-out forwards;
   }
        `}</style>
        </div>
    );
}

