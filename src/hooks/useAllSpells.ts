import { useEffect } from 'react';
import { fetchAllSpells } from '../lib/supabase';
import type { Spell } from '../components/IconQuiz';
import useSWR from 'swr'


export function useAllSpells(): Spell[] | undefined {
    const { data: spells, error } = useSWR<Spell[]>(
        'all-spells',
        fetchAllSpells,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60 * 60,
        }
    )

    useEffect(() => {
        if (!spells) return
        spells.forEach((s) => {
            const img = new Image()
            img.src = s.iconUrl
        })
    }, [spells])

    if (error) {
        console.error('Failed to load spells', error)
        return []
    }
    return spells
}