import React, { useState } from 'react';
import { Trophy, Award, Gift, Sparkles, Flame, Zap, CheckCircle2, RefreshCw, TreePine, Sun, ShieldCheck, Waves } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audioEngine';

interface EcoArcadeGamificationProps {
  userPoints: number;
  userLevel: number;
  onAddImpact: (co2Kg: number, pts: number) => void;
}

interface BiomeTile {
  id: string;
  name: string;
  costPts: number;
  co2ImpactKg: number;
  icon: string;
  type: 'tree' | 'solar' | 'ocean' | 'garden';
  count: number;
}

export const EcoArcadeGamification: React.FC<EcoArcadeGamificationProps> = ({
  userPoints,
  userLevel,
  onAddImpact
}) => {
  const [chestOpened, setChestOpened] = useState(false);
  const [chestReward, setChestReward] = useState<{ pts: number; co2: number; title: string } | null>(null);
  const [streakDays, setStreakDays] = useState(5);
  const [streakClaimed, setStreakClaimed] = useState(false);

  // Terraformer Biome Tiles state
  const [biomeTiles, setBiomeTiles] = useState<BiomeTile[]>([
    { id: 'b1', name: 'Amazon Rainforest Tree', costPts: 50, co2ImpactKg: 25, icon: '🌲', type: 'tree', count: 2 },
    { id: 'b2', name: 'Desert Solar Panel Unit', costPts: 100, co2ImpactKg: 60, icon: '☀️', type: 'solar', count: 1 },
    { id: 'b3', name: 'Ocean Plastics Sweeper', costPts: 80, co2ImpactKg: 45, icon: '🌊', type: 'ocean', count: 1 },
    { id: 'b4', name: 'Urban Vertical Bio-Wall', costPts: 40, co2ImpactKg: 20, icon: '🌿', type: 'garden', count: 3 },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Open Daily Mystery Chest
  const handleOpenChest = () => {
    if (chestOpened) return;

    soundEngine.playChime('levelUp');
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a3e635', '#38bdf8', '#f59e0b', '#ec4899']
    });

    const rewardPts = 150;
    const rewardCo2 = 75;
    const title = '🌟 Golden Gaia Seed (+150 Green Pts & 75kg CO₂ Offset)';

    setChestOpened(true);
    setChestReward({ pts: rewardPts, co2: rewardCo2, title });
    onAddImpact(rewardCo2, rewardPts);
    showToast('🎉 Opened Daily Mystery Chest! +150 Green Points');
  };

  // Claim Daily Streak
  const handleClaimStreak = () => {
    if (streakClaimed) return;

    soundEngine.playChime('nature');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#a3e635', '#10b981']
    });

    setStreakDays(prev => prev + 1);
    setStreakClaimed(true);
    onAddImpact(30, 80);
    showToast('🔥 Daily Streak Claimed! Day ' + (streakDays + 1) + ' Streak Unlocked!');
  };

  // Build / Deploy Biome Item in Terraformer Arcade
  const handleBuildTile = (tileId: string) => {
    const tile = biomeTiles.find(b => b.id === tileId);
    if (!tile) return;

    if (userPoints < tile.costPts) {
      showToast(`⚠️ Need ${tile.costPts} Green Points to deploy ${tile.name}!`);
      return;
    }

    soundEngine.playChime('achievement');
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#a3e635', '#34d399']
    });

    setBiomeTiles(prev =>
      prev.map(b => (b.id === tileId ? { ...b, count: b.count + 1 } : b))
    );

    // Apply offset (deduct points in flow or add co2 offset)
    onAddImpact(tile.co2ImpactKg, -tile.costPts);
    showToast(`✨ Deployed ${tile.name}! +${tile.co2ImpactKg}kg CO₂ Planet Healing`);
  };

  // Calculate Level Rank Title
  const getRankTitle = (lvl: number) => {
    if (lvl <= 1) return 'Seedling Guardian';
    if (lvl === 2) return 'Canopy Defender';
    if (lvl === 3) return 'Biome Sentinel';
    if (lvl === 4) return 'Gaia Architect';
    return 'Planetary Savior';
  };

  const nextLevelXp = userLevel * 500;
  const currentXpProgress = Math.min(100, Math.round((userPoints / nextLevelXp) * 100));

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-lime-950 border border-lime-400 text-lime-300 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 text-xs font-black flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lime-400 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP ROW: GAMIFIED STATS & DAILY STREAK CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Player Level & Rank Title */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-black/80 to-lime-950/40 border border-lime-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono-tech text-lime-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Eco Agent Level
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-black text-[10px] font-black uppercase">
                Level {userLevel}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {getRankTitle(userLevel)}
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Gain Green Points to level up and unlock higher Gaia privileges.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <span>XP Progress</span>
              <span className="text-lime-400">{userPoints} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${currentXpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Streak Flame */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-black/80 to-amber-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono-tech text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Sustainability Streak
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                {streakDays} Days Streak
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
              🔥 {streakDays} Day Streak!
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Check in daily to build your eco streak momentum and earn multiplier rewards.
            </p>
          </div>

          <button
            onClick={handleClaimStreak}
            disabled={streakClaimed}
            className={`w-full py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              streakClaimed
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-amber-500/20 active:scale-95'
            }`}
          >
            {streakClaimed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Streak Claimed for Today!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Claim Day {streakDays + 1} Bonus (+80 Pts)</span>
              </>
            )}
          </button>
        </div>

        {/* Card 3: Daily Mystery Chest */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-black/80 to-purple-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono-tech text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Mystery Gaia Chest
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black">
                Daily Loot
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white mb-1">
              {chestOpened ? 'Chest Opened!' : 'Unlock Gaia Treasure'}
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Open your daily mystery chest to receive bonus CO₂ offsets and rare seed points.
            </p>
          </div>

          {chestOpened && chestReward ? (
            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{chestReward.title}</span>
            </div>
          ) : (
            <button
              onClick={handleOpenChest}
              className="w-full py-2.5 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-xl shadow-purple-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Open Mystery Chest</span>
            </button>
          )}
        </div>

      </div>

      {/* TERRAFORMER PLANET RESTORATION MINI-GAME ARCADE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-black/90 via-[#0a120c] to-black/90 border border-lime-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-950/80 border border-lime-500/30 text-lime-400 font-mono-tech text-xs uppercase mb-2">
              <TreePine className="w-3.5 h-3.5" /> Terraformer Arcade
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Planet Biome Restoration Simulator
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Spend your earned Green Points to deploy digital biomes. Every deployment directly heals the live 3D Earth model!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-lime-950/60 border border-lime-500/30 text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono-tech block">Available Balance</span>
            <span className="text-xl font-black text-lime-400">{userPoints} Green Pts</span>
          </div>
        </div>

        {/* Biome Deployment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {biomeTiles.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-black/60 border border-white/10 hover:border-lime-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-slate-900 border border-white/10">
                    {b.icon}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-[10px] font-extrabold">
                    x{b.count} Active
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white mb-1">{b.name}</h4>
                <p className="text-[11px] text-slate-300">
                  Heals Earth by <strong className="text-lime-400">+{b.co2ImpactKg}kg CO₂</strong>
                </p>
              </div>

              <button
                onClick={() => handleBuildTile(b.id)}
                className="w-full py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>Deploy ({b.costPts} Pts)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
