/**
 * Responsive CSS grid for audience / group management cards.
 * Column count grows with available width (works with sidebar layouts).
 */
export const MANAGEMENT_CARD_GRID_SX = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
    md: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
    lg: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))'
  },
  gap: { xs: 2, sm: 2.5, md: 3 },
  alignItems: 'stretch'
}

/** Fluid filter chip area — grows with content, scrolls only when many tags */
export const MANAGEMENT_CARD_FILTER_BOX_SX = {
  p: { xs: 1, sm: 1.5 },
  borderRadius: 1,
  minHeight: { xs: 44, sm: 52 },
  maxHeight: { xs: 'none', sm: 96, md: 112 },
  overflowY: 'auto'
}
