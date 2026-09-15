import { useState, useEffect } from 'react';

export interface PromoCountdown {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
  totalSeconds: number;
  isExpired: boolean;
}

export function usePromoCountdown(userCreatedAt?: string): PromoCountdown {
  const [timeLeft, setTimeLeft] = useState<PromoCountdown>({
    hours: '01',
    minutes: '59',
    seconds: '59',
    formatted: '01:59:59',
    totalSeconds: 7199,
    isExpired: false,
  });

  useEffect(() => {
    // 1. Determine persistent base start time (from OAuth user.createdAt or localStorage)
    let startTimestamp: number;

    if (userCreatedAt) {
      const parsed = new Date(userCreatedAt).getTime();
      startTimestamp = isNaN(parsed) ? Date.now() : parsed;
    } else {
      const stored = localStorage.getItem('estudio_smart_promo_start');
      if (stored) {
        startTimestamp = parseInt(stored, 10);
      } else {
        startTimestamp = Date.now();
        localStorage.setItem('estudio_smart_promo_start', startTimestamp.toString());
      }
    }

    // 2. Fixed 2-Hour Duration (7,200,000 milliseconds)
    const DURATION_MS = 2 * 60 * 60 * 1000;
    const expiryTimestamp = startTimestamp + DURATION_MS;

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = expiryTimestamp - now;

      if (diffMs <= 0) {
        setTimeLeft({
          hours: '00',
          minutes: '00',
          seconds: '00',
          formatted: '00:00:00',
          totalSeconds: 0,
          isExpired: true,
        });
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        const hoursStr = h.toString().padStart(2, '0');
        const minStr = m.toString().padStart(2, '0');
        const secStr = s.toString().padStart(2, '0');

        setTimeLeft({
          hours: hoursStr,
          minutes: minStr,
          seconds: secStr,
          formatted: `${hoursStr}:${minStr}:${secStr}`,
          totalSeconds: totalSec,
          isExpired: false,
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userCreatedAt]);

  return timeLeft;
}
