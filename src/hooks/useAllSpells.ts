import { useState, useEffect } from 'react';
import { fetchAllSpells } from '../lib/supabase';
import type { Spell } from '../components/IconQuiz';

export function useAllSpells() {
    const [spells, setSpells] = useState<Spell[] | null>(null);
    useEffect(() => {
        fetchAllSpells()
            .then((data) => {
                setSpells(data)
                data.forEach((s) => {
                    const img = new Image()
                    img.src = `/api/image/${s.id}`
                })
            })
            .catch((err) => {
                console.error('Failed to load spells from DB', err);
                setSpells([]);
            });
    }, []);
    return spells;
}
