import React from 'react'

type Props = {
  projectName: string
  activeFileName?: string
}

export function StatusBar({ projectName, activeFileName }: Props): JSX.Element {
  return (
    <div className="statusbar-root">
      <div className="status-left">{projectName}</div>
      <div className="status-center">{activeFileName || 'No file selected'}</div>
      <div className="status-right">Ready</div>
    </div>
  )
}


