import moment from 'moment-timezone'

const IST = 'Asia/Kolkata'

/** IANA zone from game.location.timezone, or null when not set. */
export function getGameVenueTimezone(game) {
  const tz = typeof game?.location?.timezone === 'string' ? game.location.timezone.trim() : ''
  return tz || null
}

/**
 * Player-facing start time: venue IANA when configured, otherwise IST.
 * `game.startTime` is the single source of truth; this is display only.
 */
export function getGameStartDisplay(startTime, game) {
  const empty = {
    label: 'Starts',
    dateText: '',
    timeText: '',
    fullText: 'Time not specified',
    cardText: 'Time not specified',
    shortText: 'Time not specified',
    isVenue: false,
    timezone: IST
  }

  if (!startTime) return empty

  const iana = getGameVenueTimezone(game)
  const zone = iana || IST
  const m = moment(startTime).tz(zone)

  if (!m.isValid()) return empty

  const label = iana ? 'Venue time' : 'IST (India)'

  return {
    label,
    dateText: m.format('MMM D, YYYY'),
    timeText: m.format('h:mm A'),
    fullText: m.format('DD/MM/YYYY hh:mm A'),
    cardText: m.format('MMM D, YYYY, h:mm A'),
    shortText: m.format('MMM D, h:mm A'),
    isVenue: !!iana,
    timezone: zone
  }
}
