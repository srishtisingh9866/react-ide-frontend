import { useCallback, useEffect, useMemo, useState } from 'react'

export type FileNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content?: string
}

export type ProjectState = {
  projectId: string
  name: string
  nodes: FileNode[]
  activeFileId: string | null
  selectedNodeId: string | null
}

const DEFAULT_PROJECT_ID = 'demo'

function generateInitialNodes(): FileNode[] {
  return [
    { id: 'root', name: 'MyProject', type: 'folder', parentId: null },
    { id: 'public', name: 'public', type: 'folder', parentId: 'root' },
    {
      id: 'public_index',
      name: 'index.html',
      type: 'file',
      parentId: 'public',
      content:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>CipherStudio App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n',
    },
    { id: 'src', name: 'src', type: 'folder', parentId: 'root' },
    {
      id: 'src_index',
      name: 'index.js',
      type: 'file',
      parentId: 'src',
      content:
        "import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App'\n\ncreateRoot(document.getElementById('root')).render(<App />)\n",
    },
    {
      id: 'src_app',
      name: 'App.js',
      type: 'file',
      parentId: 'src',
      content:
        "export default function App(){\n  return <div style={{padding:16}}><h2>Hello from CipherStudio</h2><p>Edit files to see live updates.</p></div>\n}\n",
    },
    {
      id: 'pkg',
      name: 'package.json',
      type: 'file',
      parentId: 'root',
      content:
        '{\n  "name": "cipherstudio-project",\n  "version": "1.0.0",\n  "main": "src/index.js",\n  "dependencies": {\n    "react": "18.3.1",\n    "react-dom": "18.3.1"\n  }\n}\n',
    },
  ]
}

function buildPathMap(nodes: FileNode[]): Record<string, FileNode> {
  const byId: Record<string, FileNode> = Object.fromEntries(nodes.map(n => [n.id, n]))
  const paths: Record<string, FileNode> = {}

  function pathFor(node: FileNode): string {
    const parts: string[] = [node.name]
    let parent = node.parentId ? byId[node.parentId] : null
    while (parent) {
      if (parent.parentId !== null) parts.unshift(parent.name)
      parent = parent.parentId ? byId[parent.parentId] : null
    }
    return parts.join('/')
  }

  for (const n of nodes) {
    if (n.type === 'file') {
      const p = pathFor(n)
      paths[p] = n
    }
  }
  return paths
}

function filesForSandpack(nodes: FileNode[]): Record<string, { code: string }> {
  const pathMap = buildPathMap(nodes)
  const files: Record<string, { code: string }> = {}
  for (const [path, node] of Object.entries(pathMap)) {
    files[path] = { code: node.content || '' }
  }
  // Ensure required files exist for a React template to avoid blank preview
  if (!files['public/index.html']) {
    files['public/index.html'] = { code: '<!DOCTYPE html>\n<html>\n  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>CipherStudio App</title></head>\n  <body><div id="root"></div></body>\n</html>\n' }
  }
  if (!files['src/index.js']) {
    files['src/index.js'] = { code: "import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App'\ncreateRoot(document.getElementById('root')).render(<App />)\n" }
  }
  if (!files['src/App.js']) {
    files['src/App.js'] = { code: "export default function App(){ return <div style={{padding:16}}><h2>Hello</h2><p>Default App restored.</p></div> }\n" }
  }
  if (!files['package.json']) {
    files['package.json'] = { code: '{\n  "name": "cipherstudio-project",\n  "version": "1.0.0",\n  "main": "src/index.js",\n  "dependencies": {\n    "react": "18.3.1",\n    "react-dom": "18.3.1"\n  }\n}\n' }
  }
  return files
}

export function useProject(projectId?: string) {
  const pid = projectId || DEFAULT_PROJECT_ID
  const [currentProjectId, setCurrentProjectId] = useState(pid)
  const storageKey = `cipherstudio:project:${currentProjectId}`

  const [state, setState] = useState<ProjectState>(() => {
    const fromStorage = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
    if (fromStorage) {
      try {
        return JSON.parse(fromStorage) as ProjectState
      } catch {}
    }
    const nodes = generateInitialNodes()
    return { projectId: currentProjectId, name: 'MyProject', nodes, activeFileId: 'src_app', selectedNodeId: 'src_app' }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {}
  }, [state, storageKey])

  const nodeById = useMemo(() => Object.fromEntries(state.nodes.map(n => [n.id, n])), [state.nodes])

  // Ensure a valid active file selection
  useEffect(() => {
    const active = state.activeFileId ? nodeById[state.activeFileId] : null
    if (!active || active.type !== 'file') {
      const firstFile = state.nodes.find(n => n.type === 'file')
      if (firstFile && firstFile.id !== state.activeFileId) {
        setState(s => ({ ...s, activeFileId: firstFile.id }))
      }
    }
  }, [state.activeFileId, state.nodes, nodeById])

  const setActiveFile = useCallback((id: string) => setState(s => ({ ...s, activeFileId: id })), [])
  const setSelectedNode = useCallback((id: string) => setState(s => ({ ...s, selectedNodeId: id })), [])

  const updateFileContent = useCallback((id: string, content: string) => {
    setState(s => ({
      ...s,
      nodes: s.nodes.map(n => (n.id === id ? { ...n, content } : n)),
    }))
  }, [])

  const protectedIds = new Set<string>(['root', 'public', 'public_index', 'src', 'src_index', 'src_app', 'pkg'])
  const isProtectedNode = useCallback((id: string) => protectedIds.has(id), [])

  const addNode = useCallback((parentId: string, name: string, type: 'file' | 'folder') => {
    const id = Math.random().toString(36).slice(2)
    const node: FileNode = { id, name, type, parentId }
    setState(s => ({ ...s, nodes: [...s.nodes, node] }))
    return id
  }, [])

  const removeNode = useCallback((id: string) => {
    setState(s => {
      if (protectedIds.has(id)) return s
      // collect all ids to remove recursively
      const toRemove = new Set<string>()
      const stack = [id]
      const childrenByParent: Record<string, FileNode[]> = {}
      for (const n of s.nodes) {
        const k = n.parentId ?? 'null'
        if (!childrenByParent[k]) childrenByParent[k] = []
        childrenByParent[k].push(n)
      }
      while (stack.length) {
        const cur = stack.pop()!
        toRemove.add(cur)
        const kids = childrenByParent[cur] || []
        for (const k of kids) stack.push(k.id)
      }
      let nextNodes = s.nodes.filter(n => !toRemove.has(n.id))
      let nextActive = toRemove.has(s.activeFileId || '')
        ? (nextNodes.find(n => n.type === 'file')?.id ?? null)
        : s.activeFileId

      const hasAnyFile = nextNodes.some(n => n.type === 'file')
      if (!hasAnyFile) {
        const newId = Math.random().toString(36).slice(2)
        const newFile: FileNode = {
          id: newId,
          name: 'NewFile.js',
          type: 'file',
          parentId: 'src',
          content: "export default function App(){ return <div style={{padding:16}}>New file</div> }\n",
        }
        nextNodes = [...nextNodes, newFile]
        nextActive = newId
      }
      const nextSelected = toRemove.has(s.selectedNodeId || '') ? nextActive : s.selectedNodeId
      return { ...s, nodes: nextNodes, activeFileId: nextActive, selectedNodeId: nextSelected }
    })
  }, [])

  const renameNode = useCallback((id: string, name: string) => {
    setState(s => ({ ...s, nodes: s.nodes.map(n => (n.id === id ? { ...n, name } : n)) }))
  }, [])

  const sandpackFiles = useMemo(() => filesForSandpack(state.nodes), [state.nodes])

  const switchProject = useCallback((newId: string) => {
    const key = `cipherstudio:project:${newId}`
    let next: ProjectState | null = null
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw) {
      try {
        next = JSON.parse(raw) as ProjectState
      } catch {}
    }
    if (!next) {
      next = { projectId: newId, name: 'MyProject', nodes: generateInitialNodes(), activeFileId: 'src_app' }
    }
    setCurrentProjectId(newId)
    setState(next)
  }, [])

  return {
    state,
    nodeById,
    setActiveFile,
    setSelectedNode,
    updateFileContent,
    addNode,
    removeNode,
    renameNode,
    sandpackFiles,
    switchProject,
    currentProjectId,
    isProtectedNode,
  }
}


