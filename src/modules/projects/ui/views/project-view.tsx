"use client"
import React, { Suspense } from 'react'
import { ResizableHandle,ResizablePanel,ResizablePanelGroup } from '@/components/ui/resizable'
import { MessagesContianer } from '../components/messages-container'

interface Props {
    projectID: string
}

export const ProjectView = ({projectID} : Props) => {
  return (
    <div className='h-screen'>
        
        <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={35} minSize={20} className='flex flex-col min-h-0'>
                
                <Suspense fallback={<p>Loading Messages...</p>}>
                    <MessagesContianer projectID={projectID}/>
                </Suspense>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50} className=''>
                TODO: Priview
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}
