/**
 * Carousel default configuration
 * @description Default settings for carousel component
 * @revised 2025-04-10
 */

/**
 * Default settings for all carousel instances
 * Centralized configuration makes it easier to manage and update defaults
 */
export const DEFAULT_SETTINGS = {
  containerId: '#carousel',
  slideId: '.slide',
  interval: 5000,
  isPlaying: true,
  pauseOnHover: false

  // Можливі майбутні налаштування (закоментовані)
  // swipeThreshold: 100,
  // keyboardControl: true,
  // infinite: true,
  // autoInit: true
}

/**
 * CSS Classes used by carousel
 * Centralizing these makes it easier to customize styling
 */
export const CSS_CLASSES = {
  ACTIVE: 'active',
  INDICATORS: 'indicators',
  INDICATOR: 'indicator',
  CONTROLS: 'controls',
  PAUSE_BTN: 'control-pause',
  PREV_BTN: 'control-prev',
  NEXT_BTN: 'control-next'
}

/**
 * DOM Element IDs
 */
export const ELEMENT_IDS = {
  INDICATORS_CONTAINER: 'indicators-container',
  PAUSE_BTN: 'pause-btn',
  PREV_BTN: 'prev-btn',
  NEXT_BTN: 'next-btn',
  PAUSE_ICON: 'fa-pause-icon',
  PLAY_ICON: 'fa-play-icon'
}

/**
 * Keyboard key codes used by carousel
 */
export const KEYS = {
  SPACE: 'Space',
  LEFT_ARROW: 'ArrowLeft',
  RIGHT_ARROW: 'ArrowRight'
}

export default {
  DEFAULT_SETTINGS,
  CSS_CLASSES,
  ELEMENT_IDS,
  KEYS
}
