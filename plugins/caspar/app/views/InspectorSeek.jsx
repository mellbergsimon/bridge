import React from 'react'
import bridge from 'bridge'
import { SharedContext } from '../sharedContext'
import { InspectorSeekLength } from '../components/Seek'

export const InspectorSeek = () => {
  const [state] = React.useContext(SharedContext)
  const [selection, setSelection] = React.useState([])

  // Fetch selection when state changes
  React.useEffect(() => {
    async function updateSelection() {
      const sel = await bridge.client.getSelection()
      setSelection(sel)
    }
    updateSelection()
  }, [state])

  const items = selection.map(id => state?.items?.[id])
  const item = items[0]
  if (!item) return null

  // Get the seek and length values from the first selected item
  const seek = item?.data?.caspar?.seek || 0
  const mediaLength = item?.data?.mediaLength
  const length = item?.data?.caspar?.length || (mediaLength - seek)

  // Calculate in and out percentages
  const inPercent = Math.round((seek / mediaLength) * 1000) / 10
  const outPercent = Math.round(((seek + length) / mediaLength) * 1000) / 10

  function handleChange (newIn, newOut) {
    for (const id of selection) {
      const item = state?.items?.[id]
      const data = item?.data
      const mediaLength = data?.mediaLength || 1
      const framerate = data?.framerate || 25

      const seekFrames = Math.round((newIn / 100) * mediaLength)
      const lengthFrames = Math.round(((newOut - newIn) / 100) * mediaLength)
      const duration = Math.round((lengthFrames / framerate) * 1000)

      bridge.items.applyItem(id, {
        data: {
          caspar: {
            seek: seekFrames,
            length: lengthFrames
          },
          duration
        }
      })
    }
  }

  return (
    <div className="View--spread">
      <InspectorSeekLength
        inValue={inPercent}
        outValue={outPercent}
        onChange={handleChange}
      />
    </div>
  )
}
