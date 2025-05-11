import React, { useRef, useEffect, useState } from 'react'
import './style.css'

export const MediaSeek = ({ inValue, outValue, maxValue, onChange }) => {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [inPoint, setInPoint] = useState(inValue)
  const [outPoint, setOutPoint] = useState(outValue)
  const [lastActiveHandle, setLastActiveHandle] = useState(null)

  const handlePointerDown = (type) => {
    setDragging(type)
    setLastActiveHandle(type)
  }

  useEffect(() => {
    setInPoint(inValue)
    setOutPoint(outValue)
  }, [inValue, outValue])

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragging || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const clampedPercent = Math.max(0, Math.min(1, percent))
      const value = clampedPercent * maxValue

      if (dragging === 'in') {
        setInPoint(Math.min(value, outPoint))
      } else {
        setOutPoint(Math.max(value, inPoint))
      }
    }

    const handlePointerUp = () => {
      // Only update if any of the values have changed
      if (inPoint !== inValue || outPoint !== outValue) {
        onChange(inPoint, outPoint)
      }
      setDragging(null)
    }

    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragging, inPoint, outPoint])

  return (
    <div className="MediaRangeSelector">
      <div ref={trackRef} className="MediaRangeSelector-track">
        <div className="MediaRangeSelector-highlightedRange">
          <div
            className="MediaRangeSelector-highlightedRange--inside"
            style={{
              left: `${(inPoint / maxValue) * 100}%`,
              width: `${((outPoint - inPoint) / maxValue) * 100}%`,
            }}
          />
        </div>

        <div
          className="MediaRangeSelector-handle MediaRangeSelector-handle--in"
          style={{ left: `${(inPoint / maxValue) * 100}%`, zIndex: lastActiveHandle === 'in' ? 2 : 1 }}
          onPointerDown={() => handlePointerDown('in')}
        >
          <span className="MediaRangeSelector-value">{millisecondsToTime(inPoint)}</span>
        </div>

        <div
          className="MediaRangeSelector-handle MediaRangeSelector-handle--out"
          style={{ left: `${(outPoint / maxValue) * 100}%`, zIndex: lastActiveHandle === 'out' ? 2 : 1 }}
          onPointerDown={() => handlePointerDown('out')}
        >
          <div className="MediaRangeSelector-value">{millisecondsToTime(outPoint)}</div>
        </div>
      </div>
    </div>
  )
}

function millisecondsToTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  } else {
    return `${pad(minutes)}:${pad(seconds)}`
  } 
}
