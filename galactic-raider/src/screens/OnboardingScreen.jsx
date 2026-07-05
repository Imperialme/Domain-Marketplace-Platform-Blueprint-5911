import React, { useState } from 'react';
import { useGame } from '../store/gameStore';

const SLIDES = [
  {
    title: 'Welcome to Cosmos Capital',
    subtitle: 'Galactic Market Simulator',
    content: 'Build a multi-billion dollar empire trading stocks, forex, crypto, commodities, and companies across 8 planets. Or start your own company with Founder Mode.',
    emoji: '🚀',
  },
  {
    title: 'Understanding Turns',
    subtitle: 'The Heartbeat of Trading',
    content: 'Each turn represents one trading cycle. Markets update, prices change, dividends pay. Taxes rotate every 60 turns. Click the play button to auto-advance turns continuously.',
    emoji: '⏳',
  },
  {
    title: 'Your Wallets',
    subtitle: '3 Separate Accounts',
    content: 'Cash (100K, daily ops) | Trading (800K, investments) | Savings (100K, earns 2% interest). Transfer between them as you rebalance. Foundation endowment grows at 3% and shields you from debt.',
    emoji: '💳',
  },
  {
    title: 'Stock Markets',
    subtitle: 'Earth & Planetary Companies',
    content: 'Universe Exchange trades 7 asset types. Earth: Blue-chip stocks. Planets: Unlock as you grow (Mars at $5B, Neptune at $100T). Buy, hold, sell for capital gains. Dividend payouts every 30 turns.',
    emoji: '📊',
  },
  {
    title: 'Crypto & Commodities',
    subtitle: 'Volatile Assets',
    content: 'Bitcoin, Ethereum, and planet tokens. Oil, gold, lithium, rare materials. Both have mean-reversion mechanics. Prices drift but do not runaway. Tax relief stacks to 75% through donations.',
    emoji: '⚡',
  },
  {
    title: 'Forex & FX Positions',
    subtitle: 'Currency Trading',
    content: 'Trade 12 currency pairs: EURUSD, GBPUSD, JPYUSD, CADUSD, AUDUSD, CNYUSD, INRUSD, BRLUSD, MXNUSD, ZARUSD, SGDUSD, CHFUSD. Long or short positions with leverage up to 5x.',
    emoji: '🌍',
  },
  {
    title: 'Planets & IPOs',
    subtitle: 'Unlock & Invest',
    content: 'Unlock planets by reaching wealth thresholds. Each planet has unique companies and risks. Book shares in IPOs at mid-price. Allocations happen on listing day. Track your oversubscription.',
    emoji: '🪐',
  },
  {
    title: 'Loans & Credit',
    subtitle: 'Leverage for Growth',
    content: 'Borrow up to 5 times your net worth. Rates vary by term (6-36 months). Interest accrues daily. Repay anytime to reduce debt. Strategic borrowing amplifies gains.',
    emoji: '💸',
  },
  {
    title: 'Taxes & Philanthropy',
    subtitle: 'Reduce Your Burden',
    content: 'Tax rates rotate every 60 turns. Capital gains tax applies on profit only. Donate to charities for tax relief. Relief stacks to 75%. Foundation endowment shields you from debt.',
    emoji: '📋',
  },
  {
    title: 'Founder Mode',
    subtitle: 'Build Your Company',
    content: 'Start your own company by injecting capital and picking an industry niche. Take loans, manage revenue and demand, launch an IPO to investors. Trade your own stock.',
    emoji: '💼',
  },
  {
    title: 'Fortune Wheel & Badges',
    subtitle: 'Streaks & Milestones',
    content: 'Log in 7 days straight for a free spin token. Land on wheel segments for random perks. Reach wealth tiers ($1M to $1T) for achievement badges.',
    emoji: '🎰',
  },
  {
    title: 'Command Center',
    subtitle: 'Your Control Hub',
    content: 'CEO Decisions: Vote on board actions. Settings: Dark mode toggle, language select (6 languages), music playlist (7 tracks). Save/load 3 game slots. Academy tab explains everything.',
    emoji: '👔',
  },
  {
    title: 'Playing Styles',
    subtitle: 'Choose Your Strategy',
    content: 'Day trader (frequent trades), long-term holder (dividend income), founder (build company), crypto bull (high volatility), forex speculator (currency moves), or diversify across all.',
    emoji: '🎯',
  },
  {
    title: "You're Ready!",
    subtitle: 'Good luck, Trader',
    content: 'Start with $1M across 3 wallets. Grow through strategy, timing, and a bit of luck. Remember: mean reversion bounds all prices. Diversify. Have fun trading!',
    emoji: '🌟',
  },
];

export function OnboardingScreen({ onComplete }) {
  const { D } = useGame();
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = SLIDES[slideIdx];
  const isLast = slideIdx === SLIDES.length - 1;

  const isDark = D.darkMode !== false;
  const bgColor = isDark ? '#030810' : '#f8fafc';
  const cardBg = isDark ? '#0A1628' : '#ffffff';
  const textColor = isDark ? '#F1F5F9' : '#1e293b';
  const subColor = isDark ? '#94A3B8' : '#64748b';
  const accentColor = '#3B82F6';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '3px',
        background: accentColor,
        width: `${((slideIdx + 1) / SLIDES.length) * 100}%`,
        transition: 'width 0.3s ease',
      }} />

      <div style={{
        background: cardBg,
        borderRadius: '16px',
        padding: '40px 30px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>{slide.emoji}</div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '8px',
        }}>
          {slide.title}
        </div>
        <div style={{
          fontSize: '14px',
          color: accentColor,
          fontWeight: '600',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {slide.subtitle}
        </div>
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: subColor,
          marginBottom: '30px',
        }}>
          {slide.content}
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <button
            onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
            disabled={slideIdx === 0}
            style={{
              padding: '10px 16px',
              background: slideIdx === 0 ? 'rgba(255,255,255,0.1)' : accentColor,
              color: slideIdx === 0 ? subColor : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: slideIdx === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: slideIdx === 0 ? 0.5 : 1,
            }}
          >
            Back
          </button>

          <div style={{
            fontSize: '12px',
            color: subColor,
            fontWeight: '600',
            minWidth: '60px',
          }}>
            {slideIdx + 1} / {SLIDES.length}
          </div>

          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setSlideIdx(slideIdx + 1);
              }
            }}
            style={{
              padding: '10px 16px',
              background: accentColor,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {isLast ? 'Start Trading' : 'Next'}
          </button>
        </div>

        <button
          onClick={onComplete}
          style={{
            marginTop: '16px',
            background: 'transparent',
            color: subColor,
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline',
          }}
        >
          Skip tutorial
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        display: 'flex',
        gap: '6px',
      }}>
        {SLIDES.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setSlideIdx(idx)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: idx === slideIdx ? accentColor : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
