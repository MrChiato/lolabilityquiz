import { useAllSpells } from '../hooks/useAllSpells';
import { useSpellStats } from '../hooks/useSpellStats';
import { useMemo, useState } from 'react';

type Row = {
    id: string;
    names: string[];
    iconUrl: string;
    correct_count: number;
    wrong_count: number;
    total: number;
    pct: number;
    topWrong: Array<[guess: string, count: number]>;
};

const headerStyle: React.CSSProperties = {
    padding: '12px',
    textAlign: 'left',
    background: '#1e1e1e',
    color: '#fff',
    cursor: 'pointer',
    userSelect: 'none',
};

const cellStyle: React.CSSProperties = {
    padding: '12px',
    color: '#eee',
};

const cellCenter: React.CSSProperties = {
    ...cellStyle,
    textAlign: 'center',
    fontFamily: 'monospace',
};

function DataPage() {
    const spells = useAllSpells();
    const stats = useSpellStats();

    const [sortKey, setSortKey] = useState<keyof Row>('pct');
    const [sortAsc, setSortAsc] = useState<boolean>(false);

    const nameToId = useMemo(() => {
        if (!spells) return {};
        const m: Record<string, string> = {};
        spells.forEach((s) => {
            s.names.forEach((n) => {
                m[n] = s.id;
            });
        });
        return m;
    }, [spells]);

    const rows = useMemo<Row[]>(() => {
        if (!spells || !stats) return [];
        return spells.map((s) => {
            const stat =
                stats.find((r) => r.spell_name === s.names[0]) || {
                    correct_count: 0,
                    wrong_count: 0,
                    wrong_guesses: [] as string[],
                };
            const total = stat.correct_count + stat.wrong_count;
            const pct = total > 0 ? Math.round((stat.correct_count / total) * 100) : 0;

            const guessCounts = stat.wrong_guesses.reduce<Record<string, number>>(
                (acc, g) => {
                    acc[g] = (acc[g] || 0) + 1;
                    return acc;
                },
                {}
            );
            const topWrong = Object.entries(guessCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3) as Array<[string, number]>;

            return {
                id: s.id,
                names: s.names,
                iconUrl: s.iconUrl,
                correct_count: stat.correct_count,
                wrong_count: stat.wrong_count,
                total,
                pct,
                topWrong,
            };
        });
    }, [spells, stats]);

    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (typeof av === 'number' && typeof bv === 'number') {
                return sortAsc ? av - bv : bv - av;
            }
            return 0;
        });
    }, [rows, sortKey, sortAsc]);

    if (!spells || !stats) {
        return <p style={{ color: '#eee', textAlign: 'center' }}>Loading data…</p>;
    }

    const onHeaderClick = (key: keyof Row) => {
        if (key === sortKey) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const renderSortIndicator = (key: keyof Row) => {
        if (key !== sortKey) return null;
        return sortAsc ? ' ↑' : ' ↓';
    };

    return (
        <div style={{ padding: 16, color: '#eee' }}>
            <h1 style={{ textAlign: 'center' }}>Quiz Data</h1>
            <div className="tableWrapper"
                style={{
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: '1px solid #333',
                    borderRadius: 8,
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>
                                Icon
                            </th>
                            <th
                                style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}
                                onClick={() => onHeaderClick('names')}
                            >
                                Name{renderSortIndicator('names')}
                            </th>
                            <th
                                style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}
                                onClick={() => onHeaderClick('correct_count')}
                            >
                                Correct{renderSortIndicator('correct_count')}
                            </th>
                            <th
                                style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}
                                onClick={() => onHeaderClick('wrong_count')}
                            >
                                Wrong{renderSortIndicator('wrong_count')}
                            </th>
                            <th
                                style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}
                                onClick={() => onHeaderClick('total')}
                            >
                                Total{renderSortIndicator('total')}
                            </th>
                            <th
                                style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}
                                onClick={() => onHeaderClick('pct')}
                            >
                                % Correct{renderSortIndicator('pct')}
                            </th>
                            <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>
                                Top Wrong Guesses
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((r, i) => (
                            <tr
                                key={r.id}
                                style={{
                                    background: i % 2 === 0 ? '#1a1a1a' : '#121212',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) =>
                                    ((e.currentTarget.style.background = '#222'))
                                }
                                onMouseLeave={(e) =>
                                ((e.currentTarget.style.background =
                                    i % 2 === 0 ? '#1a1a1a' : '#121212'))
                                }
                            >
                                <td style={cellCenter}>
                                    <img
                                        src={r.iconUrl}
                                        alt={r.names[0]}
                                        width={32}
                                        height={32}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </td>
                                <td style={cellStyle}>{r.names[0]}</td>
                                <td style={cellCenter}>{r.correct_count}</td>
                                <td style={cellCenter}>{r.wrong_count}</td>
                                <td style={cellCenter}>{r.total}</td>
                                <td style={cellCenter}>{r.pct}%</td>
                                <td style={cellStyle}>
                                    {r.topWrong.length > 0
                                        ? r.topWrong.map(([g, c]) => {
                                            const imgId = nameToId[g];
                                            return (
                                                <span
                                                    key={g}
                                                    style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}
                                                >
                                                    {imgId && (
                                                        <img
                                                            src={r.iconUrl}
                                                            alt={g}
                                                            width={20}
                                                            height={20}
                                                            style={{ objectFit: 'contain', marginRight: 4 }}
                                                        />
                                                    )}
                                                    {g} ({c})
                                                </span>
                                            );
                                        })
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataPage