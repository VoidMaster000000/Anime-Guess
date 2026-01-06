// Main exports for anime.js integration
export { animate, stagger, utils, splitText } from './anime.esm.js';
export type { AnimationParams, TargetsParam, StaggerParams } from './anime.esm.js';

export {
  useAnimeOnMount,
  useAnimeRef,
  useStaggerAnimation,
  useHoverAnimation,
  animePresets,
  runAnimation,
} from './useAnime';

export {
  Animated,
  AnimatePresence,
  StaggerContainer,
  Transition,
  AnimatedSplitText,
} from './AnimatedComponents';
