import React from 'react';
import { Match, Player } from '../types';
import { motion } from 'framer-motion';

interface TournamentBracketProps {
    matches: Match[];
}

interface BracketNodeProps {
    match: Match;
    allMatches: Match[];
}

const MatchPlayerNode: React.FC<{ player?: Player | null, isWinner: boolean }> = ({ player, isWinner }) => {
    return (
        <div className={`p-3 border-b last:border-b-0 border-white/10 flex items-center justify-between ${isWinner ? 'bg-brand/10' : 'bg-dark-900'} transition-colors`}>
            <span className={`text-sm font-bold truncate pr-3 ${isWinner ? 'text-brand' : 'text-gray-300'}`}>
                {player ? player.name : 'TBD'}
            </span>
            {player?.rating && (
                <span className="text-[10px] text-gray-500 font-mono bg-dark-800 px-1.5 py-0.5 rounded">
                    {player.rating}
                </span>
            )}
        </div>
    );
};

const BracketNode: React.FC<BracketNodeProps> = ({ match, allMatches }) => {
    // Find children (matches that point to this match)
    const priorMatches = allMatches.filter(m => m.next_match_id === match.id)
        .sort((a, b) => a.match_order - b.match_order);

    return (
        <div className="flex flex-row items-center">
            {priorMatches.length > 0 && (
                <div className="flex flex-col justify-center gap-4 border-r-2 border-brand/30 pr-8 mr-8 relative">
                    {/* Connecting lines drawn via CSS borders */}
                    <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-brand/30 -translate-y-1/2"></div>
                    {priorMatches.map(child => (
                        <BracketNode key={child.id} match={child} allMatches={allMatches} />
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 bg-dark-800 rounded-lg border border-white/20 shadow-md flex flex-col overflow-hidden shrink-0 relative z-10"
            >
                <div className="bg-dark-900 px-3 py-1.5 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-400 font-bold flex justify-between">
                    <span>Round {match.round}</span>
                    <span className={match.status === 'completed' ? 'text-brand' : 'text-gray-500'}>{match.status}</span>
                </div>

                <MatchPlayerNode
                    player={match.player1}
                    isWinner={match.winner_id === match.player1_id && !!match.winner_id}
                />
                <MatchPlayerNode
                    player={match.player2}
                    isWinner={match.winner_id === match.player2_id && !!match.winner_id}
                />
            </motion.div>
        </div>
    );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches }) => {
    if (!matches || matches.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 border border-dashed border-white/20 rounded-xl bg-dark-900">
                <p className="uppercase tracking-widest font-bold text-sm">No Bracket Data</p>
                <p className="text-xs mt-2">Waiting for matches to be seeded.</p>
            </div>
        );
    }

    // Identify final match (has no next_match_id)
    const finalMatch = matches.find(m => m.next_match_id === null);

    if (!finalMatch) {
        return <div className="text-red-500">Error: Invalid bracket structure missing Final Match.</div>;
    }

    return (
        <div className="overflow-x-auto py-12 px-6 bg-dark-900 rounded-3xl border border-white/5 custom-scrollbar">
            <div className="inline-block min-w-max">
                <BracketNode match={finalMatch} allMatches={matches} />
            </div>
        </div>
    );
};

export default TournamentBracket;
