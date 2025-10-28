import React, { useState } from 'react'

type Props = {
  projectId: string
  onSwitch: (id: string) => void
  onCreateFile: () => void
  onCreateFolder: () => void
  onRenameActive?: () => void
  onDeleteActive?: () => void
}

export function Topbar({ projectId, onSwitch, onCreateFile, onCreateFolder, onRenameActive, onDeleteActive }: Props): JSX.Element {
  const [pid, setPid] = useState(projectId)
  return (
    <div className="topbar-root">
      <div className="topbar-left">
        <input
          className="topbar-input"
          value={pid}
          onChange={e => setPid(e.target.value)}
          placeholder="project id"
        />
        <button className="btn" onClick={() => onSwitch(pid)}>Open</button>
      </div>
      <div className="topbar-right">
        <button className="btn" onClick={onCreateFile}>+ File</button>
        <button className="btn" onClick={onCreateFolder}>+ Folder</button>
        <button className="btn" onClick={onRenameActive}>Rename</button>
        <button className="btn" onClick={onDeleteActive}>Delete</button>
      </div>
    </div>
  )
}


