'use client';

import { useEffect, useMemo, useState } from 'react';
import { brandPalette } from '@/utils/brand';

/**
 * HinglishLoader — a playful, branded loading experience.
 *
 * Shows a rotating bank of Hinglish one-liners while the user waits.
 * Two layouts:
 *   - fullScreen: blurred overlay with an animated "Eastern Estate" brick stack.
 *   - inline:     compact card with just the animation + rotating line.
 *
 * Optional `context` biases the copy (e.g. show finance quips on /accounting).
 */

export type LoaderContext =
  | 'default'
  | 'finance'
  | 'construction'
  | 'customer'
  | 'sales'
  | 'bookings'
  | 'reports'
  | 'portal';

const PHRASE_BANK: Record<LoaderContext, string[]> = {
  default: [
    'Thoda patience boss, data la rahe hain…',
    'Zara ruko, system ko chai pilate hain ☕',
    'Pixels ready kar rahe hain, arriving in 3… 2… 1…',
    'Sab kuch sort ho raha hai, ek second.',
    'Hold on, ERP apna hair set kar raha hai 💁',
    'Mehnat chal rahi hai background mein — dikhega abhi.',
    'Loading… kyunki shortcut nahi hota shortcut ka koi.',
    'Server bhi insaan hai, thoda sochne do.',
    'Aapka dashboard ban raha hai, mast hoga.',
    'Cache warm ho raha hai, thand rakho.',
  ],
  finance: [
    'Hisaab mila rahe hain, ek second bhai 🧮',
    'Paisa count ho raha hai — galti nahi hogi, promise.',
    'Ledger ko chai pilane gaya hoon, aata hi hoon.',
    'Debit-credit ka jhagda sulajha rahe hain.',
    'Journal entries line mein lag rahi hain…',
    'GST, TDS, aur thoda dil — sab process ho raha hai.',
    'Totals tally ho rahe hain… CA sahab ko mat batao abhi.',
    'Rupaiya rupaiya, paisa paisa — sab gin rahe hain.',
  ],
  construction: [
    'Ek eent, do eent — site update ho rahi hai 🧱',
    'Labour break se wapas aa gaye, log load ho raha hai.',
    'Cement set ho raha hai, data bhi set hoga 🏗️',
    'Thoda ruko, phase-wise progress nikal rahe hain.',
    'Photos upload ho rahi hain, DSLR quality mein.',
    'Tower by tower, floor by floor — arriving.',
    'Site engineer ki WhatsApp se data kheench rahe hain.',
    'Concrete ready, plaster ready, data almost ready.',
  ],
  customer: [
    'Customer ki kundli nikaal rahe hain — ek sec 📜',
    'Contact details ko polish kar rahe hain.',
    'CRM ka dil khol ke data de raha hai…',
    'Naam, number, email — sab align ho raha hai.',
    'Grahak devo bhava — data aa raha hai.',
  ],
  sales: [
    'Leads garam ho rahi hain 🔥',
    'Pipeline shuffle ho rahi hai…',
    'Funnel se data tapak raha hai, pakad ke laate hain.',
    'Deals ko dry-clean kar rahe hain.',
    'Target pe nazar, data pe focus.',
  ],
  bookings: [
    'Flat number kheench ke la rahe hain 🏠',
    'Agreement dhool jhaad ke aa raha hai.',
    'Token, booking, balance — sab align ho raha hai.',
    'Possession date confirm kar ke aate hain.',
    'Unit ki kundli ready ho rahi hai.',
  ],
  reports: [
    'Charts pe lipstick laga rahe hain 💅',
    'Numbers ko suit-boot pehnake la rahe hain.',
    'Graph perfectly seedha hoga, ek minute.',
    'MIS ka parathaा sek rahe hain, garam milega.',
    'Filters dimaag laga rahe hain…',
  ],
  portal: [
    'Aapki dashboard taiyaar ho rahi hai, swagat hai 🙏',
    'Aapke ghar ki kundli nikaal rahe hain…',
    'Payments aur progress, sab ek saath aa raha hai.',
    'Site ki taaza tasveerein laa rahe hain 📸',
    'Thoda ruko, personalise ho raha hai.',
  ],
};

const GENERIC_EMOJI = ['🧱', '🏗️', '📊', '🔑', '💼', '✨', '🧾', '📐'];

function pickPhrases(context: LoaderContext): string[] {
  const base = PHRASE_BANK.default;
  const specific = PHRASE_BANK[context] || [];
  // Interleave specific + default for variety without being too "themed".
  const out: string[] = [];
  const max = Math.max(base.length, specific.length);
  for (let i = 0; i < max; i++) {
    if (specific[i]) out.push(specific[i]);
    if (base[i]) out.push(base[i]);
  }
  return out;
}

interface HinglishLoaderProps {
  context?: LoaderContext;
  fullScreen?: boolean;
  label?: string; // override — shown above the rotating line
  compact?: boolean; // small inline loader (no phrase, just animation + short label)
}

export function HinglishLoader({
  context = 'default',
  fullScreen = false,
  label,
  compact = false,
}: HinglishLoaderProps) {
  const phrases = useMemo(() => pickPhrases(context), [context]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (compact) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % phrases.length),
      2400,
    );
    return () => clearInterval(t);
  }, [phrases.length, compact]);

  const emoji = useMemo(
    () => GENERIC_EMOJI[Math.floor(Math.random() * GENERIC_EMOJI.length)],
    [],
  );

  const scoped = (
    <>
      <style>{`
        @keyframes ee-stack {
          0%   { transform: translateY(-18px); opacity: 0; }
          25%  { transform: translateY(0);     opacity: 1; }
          70%  { transform: translateY(0);     opacity: 1; }
          100% { transform: translateY(-18px); opacity: 0; }
        }
        @keyframes ee-shake {
          0%, 100% { transform: rotate(0deg); }
          25%      { transform: rotate(-2deg); }
          75%      { transform: rotate(2deg); }
        }
        @keyframes ee-float-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ee-progress {
          0%   { width: 10%;  margin-left: 0; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 10%;  margin-left: 90%; }
        }
        .ee-brick {
          animation: ee-stack 2.4s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .ee-brick--2 { animation-delay: 0.3s; }
        .ee-brick--3 { animation-delay: 0.6s; }
        .ee-brick--4 { animation-delay: 0.9s; }
        .ee-logo {
          animation: ee-shake 2.8s ease-in-out infinite;
          transform-origin: center;
        }
        .ee-phrase {
          animation: ee-float-in 0.5s ease-out;
        }
        .ee-bar {
          background: linear-gradient(90deg, transparent, ${brandPalette.primary}, transparent);
          animation: ee-progress 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-4'}`}>
        {/* Animated brick stack */}
        <div
          className={`relative ${compact ? 'h-12 w-16' : 'h-20 w-24'} flex items-end justify-center ee-logo`}
          aria-hidden="true"
        >
          {/* 4 bricks stacking */}
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              className={`ee-brick ee-brick--${n + 1} absolute rounded-sm shadow-sm`}
              style={{
                bottom: `${n * (compact ? 10 : 16)}px`,
                width: compact ? '40px' : '62px',
                height: compact ? '8px' : '12px',
                background: `linear-gradient(180deg, ${brandPalette.primary} 0%, ${brandPalette.secondary} 100%)`,
                left: '50%',
                marginLeft: compact ? '-20px' : '-31px',
              }}
            />
          ))}
          {/* Base line */}
          <div
            className="absolute bottom-0 h-[2px] rounded-full"
            style={{
              width: compact ? '56px' : '82px',
              background: brandPalette.neutral,
            }}
          />
        </div>

        {/* Label / rotating phrase */}
        {compact ? (
          <p
            className="text-xs font-medium tracking-wide"
            style={{ color: brandPalette.primary }}
          >
            {label || 'Ek second…'}
          </p>
        ) : (
          <>
            {label && (
              <p
                className="text-sm font-bold tracking-wide"
                style={{ color: brandPalette.secondary }}
              >
                {label}
              </p>
            )}
            <p
              key={idx}
              className="ee-phrase text-sm font-medium text-center max-w-sm px-4 leading-relaxed"
              style={{ color: brandPalette.primary }}
            >
              {emoji} {phrases[idx]}
            </p>
            {/* Indeterminate progress track */}
            <div
              className="w-40 h-1 rounded-full overflow-hidden mt-1"
              style={{ background: `${brandPalette.primary}15` }}
            >
              <div className="h-full ee-bar rounded-full" />
            </div>
          </>
        )}
      </div>
    </>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        style={{ background: `${brandPalette.background}DD` }}
      >
        <div
          className="rounded-3xl border shadow-lg px-8 py-10"
          style={{
            borderColor: `${brandPalette.primary}20`,
            background: brandPalette.surface,
            minWidth: '280px',
          }}
        >
          {scoped}
        </div>
      </div>
    );
  }

  return <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-16'}`}>{scoped}</div>;
}

export default HinglishLoader;
