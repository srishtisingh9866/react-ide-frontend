import React from 'react'
import type { FileNode } from '../state/useProject'

type Props = {
  nodes: FileNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function indent(depth: number) {
  return { paddingLeft: depth * 12 }
}

export function Explorer({ nodes, selectedId, onSelect }: Props): JSX.Element {
  const byParent: Record<string, FileNode[]> = {}
  for (const n of nodes) {
    const key = n.parentId ?? 'null'
    byParent[key] = byParent[key] || []
    byParent[key].push(n)
  }
  for (const k of Object.keys(byParent)) byParent[k].sort((a, b) => a.name.localeCompare(b.name))

  function render(parentId: string | null, depth = 0): JSX.Element[] {
    const list = byParent[parentId ?? 'null'] || []
    return list.map(n => {
      if (n.type === 'folder') {
        return (
          <div key={n.id}>
            <div
              className={`explorer-folder${selectedId === n.id ? ' is-active' : ''}`}
              style={indent(depth)}
              onClick={() => onSelect(n.id)}
            >
              <span className="ico">📁</span> {n.name}
            </div>
            {render(n.id, depth + 1)}
          </div>
        )
      }
      return (
        <div
          key={n.id}
          className={`explorer-file${selectedId === n.id ? ' is-active' : ''}`}
          style={indent(depth)}
          onClick={() => onSelect(n.id)}
        >
          <span className="ico">📄</span> {n.name}
        </div>
      )
    })
  }

  return (
    <div className="explorer-root">
      <div className="explorer-header">FILES</div>
      {render('root')}
    </div>
  )
}


