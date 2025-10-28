import React from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'

type Props = {
  files: Record<string, { code: string }>
}

export function Preview({ files }: Props): JSX.Element {
  return (
    <div className="preview-root">
      <Sandpack
        template="react"
        files={files}
        style={{ height: '100%' }}
        options={{
          layout: 'preview',
          externalResources: [],
          showTabs: false,
          showLineNumbers: false,
          recompileMode: 'delayed',
          recompileDelay: 400,
        }}
      />
    </div>
  )
}


