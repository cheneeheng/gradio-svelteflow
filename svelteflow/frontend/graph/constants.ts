/**
 * Timing constants for user interactions
 */
export const DOUBLE_CLICK_DELAY = 250; // milliseconds
export const DRAG_COMPLETE_DELAY = 10; // milliseconds
export const ZOOM_ANIMATION_DURATION = 800; // milliseconds
export const ZOOM_COMPLETE_BUFFER = 50; // milliseconds after animation

/**
 * Search and debounce timing
 */
export const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

/**
 * Layout configuration for dagre
 */
export const LAYOUT_CONFIG = {
  NODE_WIDTH: 180,
  NODE_HEIGHT: 100,
  RANK_SEPARATION: 200, // Vertical/horizontal spacing between ranks
  NODE_SEPARATION: 100, // Spacing between nodes in same rank
} as const;

/**
 * Handle positioning offsets (in pixels)
 */
export const HANDLE_OFFSET = {
  LEFT: -13,
  RIGHT: -13,
  VERTICAL: "50%",
} as const;

/**
 * UI constraints
 */
export const UI_CONSTRAINTS = {
  MIN_NODE_WIDTH: 220,
  MAX_NODE_WIDTH: 300,
  POPUP_MAX_HEIGHT: "90vh",
  FORM_MAX_HEIGHT: "50vh",
} as const;

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  NODE: 1,
  TOOLBAR: 10,
  POPUP: 100,
  DIALOG: 200,
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ALLOW_SELF_LOOPS: false,
  ENABLE_CIRCULAR_DETECTION: false,
  AUTO_LAYOUT_ON_COLLAPSE: true,
} as const;
