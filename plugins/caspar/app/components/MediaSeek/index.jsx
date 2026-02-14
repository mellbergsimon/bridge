import { useRef, useEffect, useState } from 'react'

import "./style.css"

const MediaHandle = ({ style, handlePointerDown, type, timestamp }) => {
  return (
    <div
      className={"MediaHandle"}
      style={style}
      onPointerDown={() => handlePointerDown(type)}
    >
      <span className="MediaHandle--Value">{timestamp}</span>
    </div>
  )
}

const MediaSelectionBar = ({
  handlePositions,
  handlePointerDown,
  maxValue,
}) => {
  const [lastActiveHandle, setLastActiveHandle] = useState(null)

  const pointerDown = (type) => {
    handlePointerDown(type)
    setLastActiveHandle(type)
  }

  const isFullRange =
    handlePositions.in === 0 && handlePositions.out === maxValue

  return (
    <>
      <div className="MediaSelectionBar">
        <div
          className="MediaSelectionBar-highlighted"
          style={{
            left: `${(handlePositions.in / maxValue) * 100}%`,
            width: `${
              ((handlePositions.out - handlePositions.in) / maxValue) * 100
            }%`,
          }}
        >
          <div
            className="MediaSelectionBar-highlightedBar"
            onPointerDown={() => handlePointerDown("bar")}
            style={{
              opacity: isFullRange ? 0 : 1,

              pointerEvents: isFullRange ? "none" : "auto",
            }}
          >
            =
          </div>
        </div>
      </div>

      <div>
        <MediaHandle
          style={{
            left: `${(handlePositions.in / maxValue) * 100}%`,
            zIndex: lastActiveHandle === "in" ? 2 : 1,
          }}
          handlePointerDown={pointerDown}
          type="in"
          timestamp={millisecondsToTime(handlePositions.in)}
        />

        <MediaHandle
          style={{
            left: `${(handlePositions.out / maxValue) * 100}%`,
            zIndex: lastActiveHandle === "out" ? 2 : 1,
          }}
          handlePointerDown={pointerDown}
          type="out"
          timestamp={millisecondsToTime(handlePositions.out)}
        />
      </div>
    </>
  )
}

export const MediaSeek = ({ inValue, outValue, maxValue, onChange }) => {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [handlePositions, setHandlePositions] = useState({
    in: inValue,
    out: outValue,
  })

  // Sync internal state when props change
  useEffect(() => {
    setHandlePositions({ in: inValue, out: outValue })
  }, [inValue, outValue])

  // Accept an optional ref for the bar when dragging the bar
  const handlePointerMove = (e) => {
    const rect = trackRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const clampedPercent = Math.max(0, Math.min(1, percent))
    const value = clampedPercent * maxValue

    if (dragging === "in") {
      setHandlePositions((prev) => ({
        ...prev,
        in: Math.min(value, prev.out),
      }))
    } else if (dragging === "out") {
      setHandlePositions((prev) => ({
        ...prev,
        out: Math.max(value, prev.in),
      }))
    } else { // dragging the whole bar
      const range = handlePositions.out - handlePositions.in
      let newInPoint = value - range / 2
      let newOutPoint = value + range / 2

      if (newInPoint < 0) {
        newInPoint = 0
        newOutPoint = range
      } else if (newOutPoint > maxValue) {
        newOutPoint = maxValue
        newInPoint = maxValue - range
      }

      setHandlePositions(() => ({
        in: newInPoint,
        out: newOutPoint,
      }))
    }
  }

  const handlePointerDown = (type) => {
    setDragging(type)
  }

  const handlePointerUp = () => {
    // Only trigger onChange if values have changed
    if (handlePositions.in !== inValue || handlePositions.out !== outValue) {
      onChange(handlePositions.in, handlePositions.out)
    }
    setDragging(null)
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [dragging, handlePointerMove, handlePointerUp])

  return (
    <div className="MediaSeekBar">
      <div ref={trackRef} className="MediaSeekBar-track">
        <MediaSelectionBar
          handlePositions={handlePositions}
          handlePointerDown={handlePointerDown}
          maxValue={maxValue}
        />
      </div>
    </div>
  )
}

function millisecondsToTime(ms) {
  if (ms < 0) return "00:00"
  if (!ms) return "00:00"

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n) => n.toString().padStart(2, "0")

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  } else {
    return `${pad(minutes)}:${pad(seconds)}`
  }
}
