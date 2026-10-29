import { useEffect, useState } from 'react'
import { person } from '../data/content'

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: person.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const read = () => formatter.format(Date.now()).split(':')

export default function LocalTime({ className = '' }) {
  const [time, setTime] = useState(read)

  useEffect(() => {
    const id = setInterval(() => setTime(read()), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <time className={`tabular-nums ${className}`} aria-label={`Local time in Karachi: ${time.join(':')}`}>
      {time[0]}
      <span className="animate-pulse">:</span>
      {time[1]}
      <span className="ml-1.5 text-dim">GMT+5</span>
    </time>
  )
}
