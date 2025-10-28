import React from 'react'
import { Explorer } from './components/Explorer'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { useProject } from './state/useProject'
import { Topbar } from './components/Topbar'
import { useTheme } from './state/useTheme'
import { ResizableLayout } from './components/ResizableLayout'
import { StatusBar } from './components/StatusBar'

export function App(): JSX.Element {
  const project = useProject('demo')
  const { theme, toggle } = useTheme()
  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="brand">CipherStudio</h1>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <button className="btn btn--primary" onClick={toggle}>{theme === 'dark' ? 'Light' : 'Dark'} mode</button>
          <div style={{opacity:0.7}}>{project.state.name} · id={project.state.projectId}</div>
        </div>
      </header>
      <Topbar
        projectId={project.currentProjectId}
        onSwitch={(id) => project.switchProject(id)}
        onCreateFile={() => project.addNode('src', `file-${Math.random().toString(36).slice(2)}.js`, 'file')}
        onCreateFolder={() => {
          const folderId = project.addNode('root', `folder-${Math.random().toString(36).slice(2)}`, 'folder')
          // select the folder so user can rename/delete immediately
          project.setSelectedNode(folderId)
        }}
        onRenameActive={() => {
          const id = project.state.selectedNodeId || project.state.activeFileId
          if (!id) return
          if (project.isProtectedNode(id)) return alert('This item is protected.')
          const current = project.nodeById[id]
          const next = prompt('Rename to:', current?.name)
          if (next && next !== current?.name) project.renameNode(id, next)
        }}
        onDeleteActive={() => {
          const id = project.state.selectedNodeId || project.state.activeFileId
          if (!id) return
          if (project.isProtectedNode(id)) return alert('This item is protected and cannot be deleted.')
          if (confirm('Delete this item (recursive if folder)?')) project.removeNode(id)
        }}
      />
      <main className="layout">
        <ResizableLayout
          sidebar={<Explorer nodes={project.state.nodes} selectedId={project.state.selectedNodeId} onSelect={(id) => {
            project.setSelectedNode(id)
            const node = project.nodeById[id]
            if (node?.type === 'file') project.setActiveFile(id)
          }} />}
          center={project.state.activeFileId ? (
            <Editor nodes={project.state.nodes} activeFileId={project.state.activeFileId} onChange={project.updateFileContent} />
          ) : (
            <div className="editor-empty">No file selected</div>
          )}
          right={<Preview files={project.sandpackFiles} />}
        />
      </main>
      <StatusBar
        projectName={project.state.name}
        activeFileName={project.state.activeFileId ? project.nodeById[project.state.activeFileId]?.name : undefined}
      />
    </div>
  )
}


