/**
 * MOTOR HYPERFRAME 2.0 (Video-as-Code Engine)
 * Responsável pelas animações com física real (Springs, Easing cúbico, Kinetic typography)
 * e rasterização de quadros cinematográficos estilo After Effects / Remotion.
 */

export interface HyperSpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

export const HYPER_SPRINGS = {
  punchy: { damping: 12, stiffness: 180, mass: 0.8 },
  smooth: { damping: 20, stiffness: 120, mass: 1 },
  bouncy: { damping: 8, stiffness: 140, mass: 0.6 },
};

/**
 * Função de interpolação com clamping seguro
 */
export function hyperInterpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/**
 * Curva cúbica suave (Ease-Out-Back / Pop cinematográfico)
 */
export function hyperEaseOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const clamped = Math.min(1, Math.max(0, t));
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
}

/**
 * Curva de entrada elástica de alta retenção
 */
export function hyperEaseOutExpo(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped);
}
