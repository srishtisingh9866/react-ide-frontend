import React, { useMemo, useCallback } from 'react'
import type { FileNode } from '../state/useProject'
import Monaco from '@monaco-editor/react'

type Props = {
  nodes: FileNode[]
  activeFileId: string | null
  onChange: (id: string, content: string) => void
}

export function Editor({ nodes, activeFileId, onChange }: Props): JSX.Element {
  const file = useMemo(() => nodes.find(n => n.id === activeFileId && n.type === 'file'), [nodes, activeFileId])

  if (!file) return <div className="editor-empty">Select a file to edit</div>

  const language = useMemo(() => {
    if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) return 'typescript'
    if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) return 'javascript'
    if (file.name.endsWith('.json')) return 'json'
    if (file.name.endsWith('.css')) return 'css'
    if (file.name.endsWith('.html')) return 'html'
    return 'plaintext'
  }, [file.name])

  const handleChange = useCallback((value?: string) => {
    onChange(file.id, value ?? '')
  }, [file.id, onChange])

  return (
    <div className="editor-root">
      <div className="editor-title">{file.name}</div>
      <div className="editor-monaco">
        <Monaco
          value={file.content || ''}
          language={language}
          theme={window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'light'}
          onChange={handleChange}
          options={{ fontSize: 13, minimap: { enabled: false }, scrollbar: { vertical: 'auto' } }}
        />
      </div>
    </div>
  )
}


