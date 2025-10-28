import React, { useCallback, useMemo, useRef, useState } from 'react'

type Props = {
  sidebar: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}

export function ResizableLayout({ sidebar, center, right }: Props): JSX.Element {
  const [cols, setCols] = useState<[number, number, number]>([240, 1, 1])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef<null | { which: 'left' | 'right'; startX: number; startCols: [number, number, number] }>(null)

  const templateColumns = useMemo(() => `${cols[0]}px 6px minmax(200px, 1fr) 6px minmax(240px, 1fr)`, [cols])

  const onDown = useCallback((which: 'left' | 'right') => (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = { which, startX: e.clientX, startCols: cols }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [cols])

  const onMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const { which, startX, startCols } = dragging.current
    const dx = e.clientX - startX
    if (which === 'left') {
      const nextLeft = Math.max(160, startCols[0] + dx)
      setCols([nextLeft, startCols[1], startCols[2]])
    } else {
      // distribute delta between center and right by shifting the right pane size
      const totalFlex = startCols[1] + startCols[2]
      const pxPerFlex = 400 // rough mapping factor
      const flexDelta = dx / pxPerFlex
      const nextCenter = Math.max(0.5, startCols[1] + flexDelta)
      const nextRight = Math.max(0.5, totalFlex - nextCenter)
      setCols([startCols[0], nextCenter, nextRight])
    }
  }, [])

  const onUp = useCallback(() => {
    dragging.current = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }, [onMove])

  return (
    <div ref={containerRef} className="layout-resizable" style={{ gridTemplateColumns: templateColumns }}>
      <aside className="sidebar">{sidebar}</aside>
      <div className="gutter" onMouseDown={onDown('left')} />
      <section className="center">{center}</section>
      <div className="gutter" onMouseDown={onDown('right')} />
      <section className="right">{right}</section>
    </div>
  )
}


