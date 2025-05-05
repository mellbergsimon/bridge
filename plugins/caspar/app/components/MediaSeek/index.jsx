import React, { useRef, useEffect, useState } from 'react'
import './style.css'

export const MediaSeek = ({ inValue, outValue, onChange }) => {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [inPercent, setInPercent] = useState(inValue)
  const [outPercent, setOutPercent] = useState(outValue)

  const handlePointerDown = (type) => {
    setDragging(type)
  }

  useEffect(() => {
    setInPercent(inValue)
    setOutPercent(outValue)
  }, [inValue, outValue])

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragging || !trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.max(0, Math.min(100, percent))

      if (dragging === 'in') {
        setInPercent(Math.min(clamped, outValue - .1))
      } else {
        setOutPercent(Math.max(clamped, inValue + .1))
      }
    }

    const handlePointerUp = () => {
      // Only update if any of the values have changed
      if (inPercent !== inValue || outPercent !== outValue) {
        onChange(inPercent, outPercent)
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
  }, [dragging, inPercent, outPercent, onChange])

  return (
    <div className="InspectorSeekLength">
      <div ref={trackRef} className="InspectorSeekLength-track">
        <div
          className="InspectorSeekLength-highlightedRange"
          style={{
            left: `${inPercent}%`,
            width: `${outPercent - inPercent}%`
          }}
        />
        <div
          className="InspectorSeekLength-handle"
          style={{ left: `${inPercent}%` }}
          onPointerDown={() => handlePointerDown('in')}
        />
        <div
          className="InspectorSeekLength-handle InspectorSeekLength-handle--out "
          style={{ left: `${outPercent}%` }}
          onPointerDown={() => handlePointerDown('out')}
        />
      </div>
      <div className="InspectorSeekLength-labels">
        <span>{inPercent.toFixed(1)}%</span>
        <span>{outPercent.toFixed(1)}%</span>
      </div>
    </div>
  )
}
