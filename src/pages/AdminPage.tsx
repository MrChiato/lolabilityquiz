import { useState, useEffect, useRef, useCallback } from 'react'

type Spell = {
    id: string
    icon_url: string
    names: string[]
    hint: string
    description: string
    difficulty: number
}

export default function AdminPage() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [keyInput, setKeyInput] = useState('')

    const [spells, setSpells] = useState<Spell[]>([])
    const [filter, setFilter] = useState('')
    const [status, setStatus] = useState<string | null>(null)

    const [iconUrl, setIconUrl] = useState('')
    const [names, setNames] = useState('')
    const [hint, setHint] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState(1)
    const [editingId, setEditingId] = useState<string | null>(null)

    const formRef = useRef<HTMLDivElement>(null)

    const fetchSpells = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/spells', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            const { data } = await res.json();
            setSpells(data);
        } catch (err: any) {
            console.error(err);
            setStatus('Failed to load spells: ' + err.message);
        }
    }, []);

    async function handleLogin(e: { preventDefault: () => void }) {
        e.preventDefault()
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: keyInput })
        })
        if (res.ok) {
            setLoggedIn(true)
        }
        else alert('Wrong key')
    }

    useEffect(() => {
        if (loggedIn) fetchSpells()
    }, [loggedIn, fetchSpells])

    if (!loggedIn) {
        if (!loggedIn) {
            return (
                <div
                >
                    <div
                        style={{
                            background: '#1e1e1e',
                            padding: '2rem',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            width: 320,
                            color: '#eee',
                        }}
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            Admin Login
                        </h2>
                        <form
                            onSubmit={handleLogin}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            <input
                                type="password"
                                placeholder="Enter admin key…"
                                value={keyInput}
                                onChange={e => setKeyInput(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: 4,
                                    border: '1px solid #444',
                                    background: '#121212',
                                    color: '#eee',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FFC946')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#444')}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: 4,
                                    border: 'none',
                                    background: '#FFC946',
                                    color: '#121212',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e =>
                                    (e.currentTarget.style.background = '#e0b43f')
                                }
                                onMouseLeave={e =>
                                    (e.currentTarget.style.background = '#FFC946')
                                }
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            )
        }
    }

    const visible = spells.filter(s =>
        s.names.join(' ')
            .toLowerCase()
            .includes(filter.toLowerCase()) ||
        s.icon_url.includes(filter)
    )

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this spell?')) return;

        const res = await fetch('/api/admin/spells', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) {
            console.error(await res.text());
            setStatus('Delete failed');
        } else {
            setStatus('Deleted!');
            setSpells(spells.filter(s => s.id !== id));
        }
    };



    const startEdit = (s: Spell) => {
        setEditingId(s.id)
        setIconUrl(s.icon_url)
        setNames(s.names.join(', '))
        setHint(s.hint)
        setDescription(s.description)
        setDifficulty(s.difficulty)
        setStatus(null)
        formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setIconUrl(''); setNames(''); setHint(''); setDescription(''); setDifficulty(1)
        setStatus(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!iconUrl.trim() || !names.trim()) {
            setStatus('Icon URL and names are required');
            return;
        }

        const body: Record<string, any> = {
            icon_url: iconUrl.trim(),
            names: names
                .split(',')
                .map((n) => n.trim())
                .filter(Boolean),
            hint: hint.trim(),
            description: description.trim(),
            difficulty,
        };

        const method = editingId ? 'PUT' : 'POST';
        if (editingId) {
            body.id = editingId;
        }

        try {
            const res = await fetch('/api/admin/spells', {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const payloadRes = await res.json();
            if (!res.ok) {
                throw new Error(payloadRes.error || res.statusText);
            }

            setStatus(editingId ? 'Updated!' : 'Created!');
            cancelEdit();
            fetchSpells();
        } catch (err: any) {
            console.error('Save error', err);
            setStatus('Failed to save: ' + err.message);
        }
    };


    return (
        <div style={{ padding: 16, color: '#eee', maxWidth: 960, margin: '0 auto' }}>
            <h1>Manage Spells</h1>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <input
                    placeholder="Search by name or URL…"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{
                        width: '935px',
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid #444',
                        background: '#1e1e1e',
                        color: '#eee',
                    }}
                />
                <button
                    onClick={fetchSpells}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#0xFF',
                        border: 'none',
                        color: '#eee',
                        cursor: 'pointer'
                    }}
                >
                    ↺
                </button>
            </div>

            <div
                style={{
                    height: 400,
                    width: 960,
                    overflowY: 'auto',
                    border: '1px solid #444',
                    borderRadius: 4,
                    marginBottom: 24,
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Icon', 'Primary', 'Aliases', 'Hint', 'Diff', 'Edit', 'Delete'].map(h => (
                                <th key={h} style={{
                                    padding: '8px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #555',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#2a2a2a',
                                    zIndex: 1,
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: 8 }}>
                                    <img
                                        src={`/api/image/${s.id}`}
                                        width={32} height={32}
                                        style={{ objectFit: 'contain', borderRadius: 4 }}
                                    />
                                </td>
                                <td style={{ padding: 8 }}>{s.names[0]}</td>
                                <td style={{ padding: 8 }}>{s.names.slice(1).join(', ') || '—'}</td>
                                <td style={{ padding: 8 }}>{s.hint}</td>
                                <td style={{
                                    padding: 8,
                                    textAlign: 'center',
                                    fontFamily: 'monospace',
                                }}>{s.difficulty}</td>
                                <td style={{ padding: 8 }}>
                                    <button
                                        onClick={() => startEdit(s)}
                                        style={{
                                            background: '#FFC946',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                                <td style={{ padding: 8 }}>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        style={{
                                            background: '#e55353',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            color: '#fff',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#555' }}>
                                    No spells found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{
                background: '#1e1e1e',
                padding: 16,
                borderRadius: 8,
                maxWidth: 480,
                margin: '0 auto'
            }}>
                <h2 style={{ textAlign: 'center' }}>
                    {editingId ? 'Edit Spell' : 'Add New Spell'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ marginRight: 8 }}>
                        Icon URL<br />
                        <input
                            value={iconUrl}
                            onChange={e => setIconUrl(e.target.value)}
                            placeholder="https://...jpg"
                            style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                        />
                    </label>
                    <label style={{ marginRight: 8 }}>
                        Names (comma-separated)<br />
                        <input
                            value={names}
                            onChange={e => setNames(e.target.value)}
                            placeholder="Primary, Alias1, Alias2"
                            style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                        />
                    </label>
                    <label style={{ marginRight: 8 }}>
                        Hint<br />
                        <input
                            value={hint}
                            onChange={e => setHint(e.target.value)}
                            style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                        />
                    </label>
                    <label style={{ marginRight: 8 }}>
                        Description<br />
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                        />
                    </label>
                    <label>
                        Difficulty<br />
                        <select
                            value={difficulty}
                            onChange={e => setDifficulty(Number(e.target.value))}
                            style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                        >
                            {[1, 2, 3, 4, 5].map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="submit"
                        style={{
                            padding: '0.75rem',
                            background: '#28a745',
                            border: 'none',
                            borderRadius: 4,
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Save Spell
                    </button>
                </form>
                {status && <p style={{ marginTop: 12, textAlign: 'center' }}>{status}</p>}
            </div>
        </div>
    );
}
