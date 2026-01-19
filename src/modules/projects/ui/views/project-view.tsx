"use client"
import React, { Suspense, useState } from 'react'
import { ResizableHandle,ResizablePanel,ResizablePanelGroup } from '@/components/ui/resizable'
import { MessagesContianer } from '../components/messages-container'
import { Fragment } from '@/generated/prisma/client'
import { ProjectHeader } from '../components/project-header'
import { FragmentWeb } from '../components/fragment-web'

interface Props {
    projectID: string
}

export const ProjectView = ({projectID} : Props) => {

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className='h-screen'>
        
        <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={35} minSize={20} className='flex flex-col min-h-0'>
                <Suspense fallback={<p>Loading Project...</p>}>
                    <ProjectHeader 
                        projectID= {projectID}
                    />
                </Suspense>
                <Suspense fallback={<p>Loading Messages...</p>}>
                    <MessagesContianer 
                        projectID={projectID}
                        activeFragment = {activeFragment}
                        setActiveFragment = {setActiveFragment}
                    />
                </Suspense>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50} className=''>
                {!!activeFragment&& <FragmentWeb data= {activeFragment}/>}
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}
