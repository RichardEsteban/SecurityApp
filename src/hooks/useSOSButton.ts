// SÁLVAME — useSOSButton Hook
// Double-click detection (800ms window) → 8s countdown → SOS activation

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { APP_CONFIG } from '../types';
import { handleSOSButtonPress } from '../services/backgroundService';

type SOSPhase = 'idle' | 'countdown' | 'active' | 'cancelled';

interface UseSOSButtonReturn {
  phase: SOSPhase;
  countdownSeconds: number;
  handlePress: () => void;
  cancelSOS: () => void;
  resetSOS: () => void;
}

export function useSOSButton(onSOSConfirmed: () => void): UseSOSButtonReturn {
  const [phase, setPhase] = useState<SOSPhase>('idle');
  const [countdownSeconds, setCountdownSeconds] = useState(APP_CONFIG.COUNTDOWN_SECONDS);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValueRef = useRef(APP_CONFIG.COUNTDOWN_SECONDS);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearCountdown();
  }, [clearCountdown]);

  const startCountdown = useCallback(() => {
    setPhase('countdown');
    countdownValueRef.current = APP_CONFIG.COUNTDOWN_SECONDS;
    setCountdownSeconds(APP_CONFIG.COUNTDOWN_SECONDS);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    countdownRef.current = setInterval(async () => {
      countdownValueRef.current -= 1;
      setCountdownSeconds(countdownValueRef.current);

      if (countdownValueRef.current <= 3 && countdownValueRef.current > 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (countdownValueRef.current <= 0) {
        clearCountdown();
        setPhase('active');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 200);
        onSOSConfirmed();
      }
    }, 1000);
  }, [clearCountdown, onSOSConfirmed]);

  const handlePress = useCallback(() => {
    if (phase === 'countdown' || phase === 'active') return;
    handleSOSButtonPress(() => startCountdown());
  }, [phase, startCountdown]);

  const cancelSOS = useCallback(async () => {
    clearCountdown();
    setPhase('cancelled');
    setCountdownSeconds(APP_CONFIG.COUNTDOWN_SECONDS);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 150);

    setTimeout(() => setPhase('idle'), 1500);
  }, [clearCountdown]);

  const resetSOS = useCallback(() => {
    clearCountdown();
    setPhase('idle');
    setCountdownSeconds(APP_CONFIG.COUNTDOWN_SECONDS);
  }, [clearCountdown]);

  return { phase, countdownSeconds, handlePress, cancelSOS, resetSOS };
}
