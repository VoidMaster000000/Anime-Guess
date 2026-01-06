/**
 * Type declarations for local anime.js ESM bundle
 */

export type TargetsParam = HTMLElement | SVGElement | NodeList | string | HTMLElement[] | SVGElement[];

export interface AnimationParams {
  translateX?: number | number[] | (() => number);
  translateY?: number | number[] | (() => number);
  scale?: number | number[];
  rotate?: number | number[];
  opacity?: number | number[];
  duration?: number;
  delay?: number | ReturnType<typeof stagger>;
  ease?: string;
  loop?: boolean | number;
  onComplete?: () => void;
  onUpdate?: () => void;
  [key: string]: any;
}

export interface StaggerParams {
  start?: number;
  from?: number | 'first' | 'center' | 'last' | 'random';
  grid?: [number, number];
  axis?: 'x' | 'y';
  ease?: string;
}

export function animate(
  target: TargetsParam | null,
  params: AnimationParams
): {
  play: () => void;
  pause: () => void;
  restart: () => void;
  reverse: () => void;
  seek: (time: number) => void;
};

export function stagger(
  value: number | [number, number],
  params?: StaggerParams
): (target: any, index: number, length: number) => number;

export const utils: {
  random: (min: number, max: number) => number;
  lerp: (start: number, end: number, amount: number) => number;
  clamp: (value: number, min: number, max: number) => number;
  round: (value: number, decimals?: number) => number;
  snap: (value: number, step: number) => number;
  wrap: (value: number, min: number, max: number) => number;
  [key: string]: any;
};

export interface SplitTextResult {
  chars?: HTMLElement[];
  words?: HTMLElement[];
  lines?: HTMLElement[];
  revert: () => void;
}

export interface SplitTextOptions {
  chars?: boolean;
  words?: boolean;
  lines?: boolean;
}

export function splitText(
  target: HTMLElement | string,
  options?: SplitTextOptions
): SplitTextResult;

export default function anime(params: AnimationParams & { targets: TargetsParam }): ReturnType<typeof animate>;
