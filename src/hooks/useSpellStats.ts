import { useState, useEffect } from 'react';
import { fetchSpellStats, SpellStat } from '../lib/supabase';

export function useSpellStats(): SpellStat[] | null {
    const [stats, setStats] = useState<SpellStat[] | null>(null);

    useEffect(() => {
        fetchSpellStats()
            .then(setStats)
            .catch((err) => {
                console.error('Failed to load spell stats', err);
                setStats([]);
            });
    }, []);

    return stats;
}
