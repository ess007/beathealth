/**
 * Haptic Feedback Utility for Mobile Devices
 * Uses Vibration API for tactile feedback on supported devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

/**
 * Trigger haptic feedback on supported devices
 * @param pattern - The intensity/pattern of haptic feedback
 */
export const haptic = (pattern: HapticPattern = 'light'): void => {
  // Check if Vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  try {
    const vibrationPattern = patterns[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Haptic feedback not supported:', error);
  }
};

/**
 * Stop any ongoing vibration
 */
export const stopHaptic = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};
