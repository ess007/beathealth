declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    ticks?: number;
    gravity?: number;
    decay?: number;
    startVelocity?: number;
    shapes?: string[];
    scalar?: number;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;
  
  export default confetti;
}
