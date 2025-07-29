// utils/timezoneConverter.js
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const convertWithGMTOffset = (date, fromOffset, toOffset) => {
  if (!date || !fromOffset || !toOffset) return null
  console.log('toOffset', toOffset);
  // Parse offsets (format: "+HH:mm" or "-HH:mm")
  const parseOffset = offset => {
    // Extract the offset string if it's an object
    const offsetStr = typeof offset === 'object' ? offset.value : offset
    // Handle cases where offset might be undefined
    if (!offsetStr) return 0

    const [hours, minutes] = offsetStr.split(':').map(Number)
    return (hours + Math.sign(hours) * (minutes / 60)) * 60 // in minutes
  }

  const fromOffsetMinutes = parseOffset(fromOffset)
  const toOffsetMinutes = parseOffset(toOffset)
  const diffMinutes = toOffsetMinutes - fromOffsetMinutes

  return dayjs(date).add(diffMinutes, 'minute')
}
