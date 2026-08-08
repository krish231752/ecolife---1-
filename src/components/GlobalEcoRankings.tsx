import React, { useState } from 'react';
import { Trophy, Medal, Crown, Sparkles, TrendingUp, Flame, ThumbsUp, Search, ShieldCheck, Globe, Award, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audioEngine';

interface TopContributor {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  country: string;
  flag: string;
  points: number;
  co2OffsetKg: number;
  streakDays: number;
  title: string;
  kudosCount: number;
  isCurrentUser?: boolean;
}

interface GlobalEcoRankingsProps {
  userPoints?: number;
  userLevel?: number;
}

const INITIAL_CONTRIBUTORS: TopContributor[] = [
  {
    rank: 1,
    id: 'c-1',
    name: 'Elena Rostova',
    avatar: '👩‍🔬',
    country: 'Sweden',
    flag: '🇸🇪',
    points: 4850,
    co2OffsetKg: 1420,
    streakDays: 42,
    title: 'Gaia Savior Supreme',
    kudosCount: 382
  },
  {
    rank: 2,
    id: 'c-2',
    name: 'Kaelen Voss',
    avatar: '👨‍🌾',
    country: 'Germany',
    flag: '🇩🇪',
    points: 4120,
    co2OffsetKg: 1180,
    streakDays: 31,
    title: 'Forest Architect',
    kudosCount: 294
  },
  {
    rank: 3,
    id: 'c-3',
    name: 'Aria Tanaka',
    avatar: '👩‍💻',
    country: 'Japan',
    flag: '🇯🇵',
    points: 3790,
    co2OffsetKg: 980,
    streakDays: 28,
    title: 'Solar Sentinel',
    kudosCount: 245
  },
  {
    rank: 4,
    id: 'c-4',
    name: 'You (Eco Agent)',
    avatar: '🌿',
    country: 'Global',
    flag: '🌐',
    points: 350, // Will be overridden dynamically by userPoints prop
    co2OffsetKg: 210,
    streakDays: 5,
    title: 'Seedling Guardian',
    kudosCount: 18,
    isCurrentUser: true
  },
  {
    rank: 5,
    id: 'c-5',
    name: 'Siddharth Sharma',
    avatar: '👨‍🎓',
    country: 'India',
    flag: '🇮🇳',
    points: 2950,
    co2OffsetKg: 780,
    streakDays: 19,
    title: 'Zero Waste Champion',
    kudosCount: 168
  },
  {
    rank: 6,
    id: 'c-6',
    name: 'Zoe Dubois',
    avatar: '👩‍🎨',
    country: 'France',
    flag: '🇫🇷',
    points: 2640,
    co2OffsetKg: 690,
    streakDays: 14,
    title: 'Clean Ocean Pioneer',
    kudosCount: 129
  },
  {
    rank: 7,
    id: 'c-7',
    name: 'Mateo Silva',
    avatar: '👨‍🚒',
    country: 'Brazil',
    flag: '🇧🇷',
    points: 2310,
    co2OffsetKg: 580,
    streakDays: 22,
    title: 'Amazon Bio-Defender',
    kudosCount: 115
  },
  {
    rank: 8,
    id: 'c-8',
    name: 'Li Wei',
    avatar: '👨‍💻',
    country: 'Singapore',
    flag: '🇸🇬',
    points: 2080,
    co2OffsetKg: 520,
    streakDays: 11,
    title: 'Urban Micro-Grider',
    kudosCount: 94
  }
];

export const GlobalEcoRankings: React.FC<GlobalEcoRankingsProps> = ({
  userPoints = 350,
  userLevel = 2
}) => {
  const [timeframe, setTimeframe] = useState<'alltime' | 'monthly' | 'weekly'>('alltime');
  const [searchQuery, setSearchQuery] = useState('');
  const [contributors, setContributors] = useState<TopContributor[]>(INITIAL_CONTRIBUTORS);
  const [kudosGiven, setKudosGiven] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync current user's points dynamically
  const updatedList = contributors.map(c => {
    if (c.isCurrentUser) {
      return {
        ...c,
        points: userPoints,
        co2OffsetKg: Math.round(userPoints * 0.6)
      };
    }
    return c;
  });

  // Sort contributors by points descending
  const sortedContributors = [...updatedList].sort((a, b) => b.points - a.points);

  // Reassign dynamic rank numbers based on points
  const rankedContributors = sortedContributors.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  // Filter based on search query
  const filteredContributors = rankedContributors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = rankedContributors.slice(0, 3);

  const handleGiveKudos = (id: string, name: string) => {
    if (kudosGiven[id]) return;

    soundEngine.playChime('water');
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#a3e635', '#38bdf8']
    });

    setKudosGiven(prev => ({ ...prev, [id]: true }));
    setContributors(prev =>
      prev.map(c => (c.id === id ? { ...c, kudosCount: c.kudosCount + 1 } : c))
    );

    setToastMsg(`👏 Sent Eco Kudos to ${name}!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper for trophy color styling & animated badge
  const renderTrophyBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/30 blur-md rounded-full animate-pulse" />
          <div className="relative p-2 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 animate-bounce">
            <Trophy className="w-5 h-5 fill-current text-amber-950" />
          </div>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="relative flex items-center justify-center">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-black shadow-lg animate-pulse">
            <Trophy className="w-4 h-4 fill-current text-slate-900" />
          </div>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="relative flex items-center justify-center">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 shadow-lg">
            <Trophy className="w-4 h-4 fill-current text-amber-950" />
          </div>
        </div>
      );
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-mono-tech font-bold text-xs text-slate-400">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-lime-950 border border-lime-400 text-lime-300 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 text-xs font-black flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lime-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER & TIME FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono-tech text-xs uppercase mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Community Competition</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Global Eco-Rankings
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Top planetary contributors ranked by cumulative Green Impact Points. Earn points through sustainable actions to climb the leaderboard!
          </p>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/80 border border-white/10 shadow-xl self-start md:self-auto">
          <button
            onClick={() => setTimeframe('alltime')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'alltime'
                ? 'bg-amber-400 text-black shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Legends
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'monthly'
                ? 'bg-amber-400 text-black shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Sprint
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeframe === 'weekly'
                ? 'bg-amber-400 text-black shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Top 10
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY WITH ANIMATED TROPHIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {top3.map((c) => {
          const isGold = c.rank === 1;
          const isSilver = c.rank === 2;
          const isBronze = c.rank === 3;

          return (
            <div
              key={c.id}
              className={`relative p-6 rounded-3xl backdrop-blur-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xl ${
                isGold
                  ? 'bg-gradient-to-b from-amber-950/50 via-black to-black border-amber-500/50 ring-2 ring-amber-400/30 scale-102 md:-translate-y-2'
                  : isSilver
                  ? 'bg-gradient-to-b from-slate-900/60 via-black to-black border-slate-400/40'
                  : 'bg-gradient-to-b from-amber-900/30 via-black to-black border-amber-700/40'
              }`}
            >
              {/* Glowing Ambient Backdrop */}
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                  isGold ? 'bg-amber-500/20' : isSilver ? 'bg-slate-300/10' : 'bg-amber-700/15'
                }`}
              />

              <div>
                {/* Header Row: Rank Badge & Flag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {renderTrophyBadge(c.rank)}
                    <span className="text-xs font-extrabold uppercase font-mono-tech tracking-wider text-slate-300">
                      Rank #{c.rank}
                    </span>
                  </div>
                  <span className="text-xl" title={c.country}>{c.flag}</span>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl p-3 rounded-2xl bg-slate-900 border border-white/10 shrink-0">
                    {c.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-1.5">
                      <span>{c.name}</span>
                      {c.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-lime-400 text-black text-[9px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> {c.title}
                    </p>
                  </div>
                </div>

                {/* Impact Points Counter Box */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 my-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
                      Total Impact Points
                    </span>
                    <span className="text-xl font-black text-lime-400 flex items-center gap-1">
                      {c.points.toLocaleString()} <span className="text-xs font-bold text-slate-400">Pts</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
                      CO₂ Offset
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {c.co2OffsetKg} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Streak & Kudos Button */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs font-bold text-amber-300/90 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {c.streakDays} Day Streak
                </span>

                <button
                  onClick={() => handleGiveKudos(c.id, c.name)}
                  disabled={kudosGiven[c.id]}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    kudosGiven[c.id]
                      ? 'bg-lime-950 text-lime-400 border border-lime-500/40 cursor-default'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${kudosGiven[c.id] ? 'text-lime-400 fill-lime-400' : ''}`} />
                  <span>{c.kudosCount} Kudos</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* FULL LEADERBOARD TABLE & SEARCH */}
      <div className="p-6 sm:p-8 rounded-3xl bg-black/80 border border-white/10 shadow-2xl space-y-6">
        
        {/* Table Search & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-lime-400" />
            <h4 className="text-lg font-black text-white">
              Complete Global Contributor Ladder
            </h4>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by contributor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400/60 transition-all"
            />
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-3">
          {filteredContributors.map((c) => {
            const isTop3 = c.rank <= 3;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  c.isCurrentUser
                    ? 'bg-lime-950/30 border-lime-400/60 ring-1 ring-lime-400/40 shadow-lg'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Left: Rank, Avatar, Name & Title */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0">
                    {renderTrophyBadge(c.rank)}
                  </div>

                  <div className="text-2xl p-2 rounded-xl bg-slate-900 border border-white/10 shrink-0">
                    {c.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">
                        {c.name}
                      </span>
                      <span className="text-sm" title={c.country}>{c.flag}</span>
                      {c.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-lime-400 text-black text-[9px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{c.title}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-current" /> {c.streakDays}d Streak
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Points, CO2 Offset & Kudos */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-extrabold text-lime-400 block">
                      {c.points.toLocaleString()} Green Pts
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {c.co2OffsetKg} kg CO₂ offset
                    </span>
                  </div>

                  <button
                    onClick={() => handleGiveKudos(c.id, c.name)}
                    disabled={kudosGiven[c.id]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      kudosGiven[c.id]
                        ? 'bg-lime-950 text-lime-400 border border-lime-500/40 cursor-default'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${kudosGiven[c.id] ? 'text-lime-400 fill-lime-400' : ''}`} />
                    <span>{c.kudosCount}</span>
                  </button>
                </div>

              </div>
            );
          })}

          {filteredContributors.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No eco contributors found matching "{searchQuery}".
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
