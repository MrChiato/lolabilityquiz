import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Spell } from '../components/IconQuiz';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: {
            'player-id': localStorage.getItem('player_id') || '',
        }
    }
});

export async function fetchLeaderboard(mode: string, limit?: number) {
    let query = supabase
        .from('lol_scores')
        .select('name,score')
        .eq('mode', mode)
        .order('score', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

function getOrCreatePlayerId(): string {
    const key = 'player_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = uuidv4();
        localStorage.setItem(key, id);
    }
    return id;
}

export async function submitScore(name: string, score: number, mode: string) {
    const playerId = getOrCreatePlayerId();
    const { data: existing, error: fetchError } = await supabase
        .from('lol_scores')
        .select('score')
        .eq('player_id', playerId)
        .eq('mode', mode)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!existing || score > existing.score) {
        const { error: upsertError } = await supabase
            .from('lol_scores')
            .upsert(
                [{ player_id: playerId, name, score, mode }],
                { onConflict: 'player_id,mode' }
            );
        if (upsertError) throw upsertError;
    }

    await fetchLeaderboard(mode);
}

export async function recordGuess(spellName: string, userGuess: string, isCorrect: boolean) {
    const { error } = await supabase.rpc('update_lol_spell_stats', {
        spellname: spellName,
        iscorrect: isCorrect,
        userguess: userGuess,
    });

    if (error) {
        console.error('Failed to update spell stats', error);
    }
}

export async function fetchAllSpells(): Promise<Spell[]> {
    const { data, error } = await supabase
        .from('lol_spells')
        .select('*');

    if (error) throw error;

    return data.map((s) => ({
        id: s.id,
        names: s.names,
        iconUrl: `/api/image/${s.id}`,
        hint: s.hint,
        description: s.description,
        difficulty: s.difficulty,
    }));
}

export type SpellStat = {
    spell_name: string;
    correct_count: number;
    wrong_count: number;
    wrong_guesses: string[];
};

export async function fetchSpellStats(): Promise<SpellStat[]> {
    const { data, error } = await supabase
        .from<'lol_spell_stats', SpellStat>('lol_spell_stats')
        .select('*');

    if (error) throw error;
    return data || [];
}

export async function recordFeedback(content: string) {
    const { error } = await supabase
        .from('lol_feedback')
        .insert([{ content }]);
    if (error) {
        console.error('Failed to record feedback', error);
        throw error;
    }
}