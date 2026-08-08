import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Clock,
  RotateCw,
  RefreshCw,
  Layers,
  Sliders,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Globe,
  Flame,
  Wind,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { DayNightMode, EarthViewMode } from '../types';

interface EcoHUDProps {
  healthPercentage: number;
  onHealClick: (category?: string, deltaHp?: number) => void;
  userPoints?: number;
  dayNightMode?: DayNightMode;
  dayNightTime?: number;
  onModeChange?: (mode: DayNightMode) => void;
  onTimeChange?: (timeHours: number) => void;
  viewMode?: EarthViewMode;
  onViewModeChange?: (mode: EarthViewMode) => void;
  isRotating?: boolean;
  onToggleRotate?: () => void;
  showClouds?: boolean;
  onToggleClouds?: () => void;
}

function getTimeInfo(hours: number) {
  const norm = ((hours % 24) + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.floor((norm - h) * 60);

  const displayH = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const mStr = m < 10 ? `0${m}` : `${m}`;
  const timeStr = `${displayH}:${mStr} ${ampm}`;

  let periodLabel = 'Day';
  let emoji = '☀️';

  if (norm >= 5 && norm < 8) {
    periodLabel = 'Dawn';
    emoji = '🌅';
  } else if (norm >= 8 && norm < 17) {
    periodLabel = 'Day';
    emoji = '☀️';
  } else if (norm >= 17 && norm < 20) {
    periodLabel = 'Dusk';
    emoji = '🌇';
  } else {
    periodLabel = 'Night';
    emoji = '🌙';
  }

  return { timeStr, periodLabel, emoji };
}

export const EcoHUD: React.FC<EcoHUDProps> = ({
  healthPercentage = 72,
  onHealClick,
  userPoints = 2450,
  dayNightMode = 'realtime',
  dayNightTime = 12,
  onModeChange,
  onTimeChange,
  viewMode = 'satellite',
  onViewModeChange,
  isRotating = true,
  onToggleRotate,
  showClouds = true,
  onToggleClouds
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [showTimeControls, setShowTimeControls] = useState(false);
  const [audioToast, setAudioToast] = useState<string | null>(null);

  const { timeStr, periodLabel, emoji } = getTimeInfo(dayNightTime);

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      soundEngine.toggleAmbient(false);
      setAudioToast('🔇 Audio Muted');
    } else if (isMusicOn) {
      soundEngine.toggleAmbient(true);
      setAudioToast('🔊 Audio Unmuted');
    }
    setTimeout(() => setAudioToast(null), 3000);
  };

  const handleToggleMusic = () => {
    const nextState = !isMusicOn;
    setIsMusicOn(nextState);
    if (!isMuted) {
      soundEngine.toggleAmbient(nextState);
    }
    if (nextState) {
      setAudioToast('🎵 Playing Soothing Planetary Ambient Sound');
    } else {
      setAudioToast('⏸️ Soothing Ambient Sound Paused');
    }
    setTimeout(() => setAudioToast(null), 3200);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER OVERLAY — COMPACT CONTROLS */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* Left: Day/Night Mode Controller Pill */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
            {/* Time badge */}
            <button
              onClick={() => setShowTimeControls(prev => !prev)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10 text-xs font-mono font-bold text-white"
              title="Toggle time controls"
            >
              <span>{emoji}</span>
              <span>{timeStr}</span>
              <span className="text-[9px] font-extrabold text-lime-400 bg-lime-500/10 px-1 py-0.5 rounded uppercase">
                {periodLabel}
              </span>
            </button>

            {/* Quick Modes */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onModeChange?.('realtime')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                  dayNightMode === 'realtime'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Sync with local time"
              >
                Local
              </button>
              <button
                onClick={() => onModeChange?.('cycle')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                  dayNightMode === 'cycle'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="24h Loop"
              >
                Cycle
              </button>
              <button
                onClick={() => {
                  onModeChange?.('manual');
                  setShowTimeControls(prev => !prev);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                  dayNightMode === 'manual'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Manual slider"
              >
                Manual
              </button>
            </div>
          </div>

          {/* Time slider popup if requested */}
          {(showTimeControls || dayNightMode === 'manual') && (
            <div className="flex items-center gap-2 bg-black/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-lime-500/30 shadow-2xl animate-in fade-in zoom-in-95">
              <button
                onClick={() => { onModeChange?.('manual'); onTimeChange?.(6); }}
                className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold cursor-pointer"
              >
                Dawn
              </button>
              <button
                onClick={() => { onModeChange?.('manual'); onTimeChange?.(12); }}
                className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[9px] font-bold cursor-pointer"
              >
                Noon
              </button>
              <button
                onClick={() => { onModeChange?.('manual'); onTimeChange?.(18); }}
                className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-bold cursor-pointer"
              >
                Dusk
              </button>
              <button
                onClick={() => { onModeChange?.('manual'); onTimeChange?.(0); }}
                className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold cursor-pointer"
              >
                Night
              </button>

              <input
                type="range"
                min={0}
                max={24}
                step={0.25}
                value={dayNightTime}
                onChange={(e) => {
                  onModeChange?.('manual');
                  onTimeChange?.(parseFloat(e.target.value));
                }}
                className="w-24 accent-lime-400 cursor-pointer h-1 bg-slate-800 rounded"
              />
            </div>
          )}
        </div>

        {/* Center: View Mode Switcher Toolbar (Satellite, Night, Health, AQI) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/80 border border-white/10 shadow-2xl backdrop-blur-xl z-40">
          <button
            onClick={() => onViewModeChange?.('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'satellite' ? 'bg-lime-400 text-black shadow-md scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Satellite Blue Marble View"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Satellite</span>
          </button>

          <button
            onClick={() => onViewModeChange?.('night')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'night' ? 'bg-amber-400 text-black shadow-md scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Night City Lights View"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Night</span>
          </button>

          <button
            onClick={() => onViewModeChange?.('health')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'health' ? 'bg-emerald-400 text-black shadow-md scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Bio-Sync Health Heatmap"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Health</span>
          </button>

          <button
            onClick={() => onViewModeChange?.('aqi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'aqi' ? 'bg-cyan-400 text-black shadow-md scale-105' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Global Air Quality Overlay"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AQI</span>
          </button>
        </div>

        {/* Right: Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="w-8 h-8 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-lime-400" />}
          </button>

          <button
            onClick={handleToggleMusic}
            className={`relative px-3 py-1.5 rounded-2xl backdrop-blur-xl border flex items-center gap-2 transition-all cursor-pointer shadow-xl ${
              isMusicOn
                ? 'bg-lime-500/25 border-lime-400 text-lime-300 ring-2 ring-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.4)] scale-105'
                : 'bg-black/80 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Soothing Planetary Ambient Sound"
          >
            <Music className={`w-4 h-4 ${isMusicOn ? 'text-lime-400 animate-pulse' : ''}`} />
            
            {isMusicOn && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-lime-400 animate-[bounce_1s_infinite_100ms] rounded-full h-full" />
                <span className="w-0.5 bg-lime-300 animate-[bounce_1s_infinite_300ms] rounded-full h-2/3" />
                <span className="w-0.5 bg-lime-400 animate-[bounce_1s_infinite_200ms] rounded-full h-full" />
              </div>
            )}

            <span className="text-[11px] font-extrabold hidden md:inline">
              {isMusicOn ? 'Soothing Sound' : 'Ambient Audio'}
            </span>
          </button>
        </div>

      </div>

      {/* Floating Audio Toast Banner */}
      {audioToast && (
        <div className="w-full flex justify-center my-1.5 pointer-events-none z-50">
          <div className="bg-lime-950/90 border border-lime-400/50 text-lime-300 px-4 py-1.5 rounded-full text-[11px] font-black shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-lime-400 animate-spin" />
            <span>{audioToast}</span>
          </div>
        </div>
      )}

      {/* 2. FLOATING ESSENTIAL CARDS (POSITIONED AT EDGES SO CENTER EARTH IS 100% UNBLOCKABLE) */}
      <div className="w-full flex-1 flex flex-col justify-between my-2 pointer-events-none">
        
        {/* Top Floating Area */}
        <div className="flex justify-start items-start pointer-events-auto">
          {/* Card 1: PLANET HEALTH (Top-Left Edge) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/70 backdrop-blur-2xl border border-lime-500/30 shadow-2xl max-w-[210px] sm:max-w-[230px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                PLANET HEALTH
              </span>
              <span className="text-xs font-black text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.6)]">
                {Math.round(healthPercentage)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 p-0.5 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-300 transition-all duration-700 shadow-[0_0_12px_rgba(132,204,22,0.8)]"
                style={{ width: `${Math.min(100, Math.max(0, healthPercentage))}%` }}
              />
            </div>

            <p className="text-[10px] font-medium text-slate-300 leading-tight">
              Your actions are healing Earth 🌏
            </p>

            <button
              onClick={() => onHealClick?.()}
              className="mt-2 w-full py-1 px-2.5 rounded-lg bg-lime-400/20 hover:bg-lime-400/30 border border-lime-400/40 text-lime-300 font-extrabold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-lime-400" />
              <span>Boost Planet (+15)</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Area */}
        <div className="flex items-end justify-between pointer-events-auto w-full gap-2">
          {/* Toggle Rotation & Clouds toolbar bottom left */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <button
              onClick={() => onToggleRotate?.()}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                isRotating ? 'bg-lime-950/80 border border-lime-500/40 text-lime-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Earth Auto Rotation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">{isRotating ? 'Rotating' : 'Paused'}</span>
            </button>

            <button
              onClick={() => onToggleClouds?.()}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                showClouds ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Cloud Layer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clouds</span>
            </button>
          </div>

          {/* Card 2: LIVE IMPACT (Bottom-Right Edge) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-[210px] sm:max-w-[230px] text-right">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-end gap-1">
              <Globe className="w-3 h-3 text-lime-400" />
              <span>LIVE IMPACT</span>
            </div>

            <div className="space-y-1.5">
              <div>
                <div className="text-lg sm:text-xl font-black text-cyan-400 leading-none">
                  22,450+
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">
                  Actions Taken
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 leading-none">
                  30.6T
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">
                  KG CO₂ Saved
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
