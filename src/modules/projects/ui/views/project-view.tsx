"use client"
import React, { Suspense, useState } from 'react'
import { ResizableHandle,ResizablePanel,ResizablePanelGroup } from '@/components/ui/resizable'
import { MessagesContianer } from '../components/messages-container'
import { Fragment } from '@/generated/prisma/client'
import { ProjectHeader } from '../components/project-header'
import { FragmentWeb } from '../components/fragment-web'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EyeIcon, CodeIcon, CrownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileExplorer } from '@/components/file-explorer'
import { UserControl } from '@/components/user-control'
import { useAuth } from '@clerk/nextjs'
import { CodeGenerationLoader } from '../components/code-generation-loader'

interface Props {
    projectID: string
}

export const ProjectView = ({projectID} : Props) => {

    const { has } = useAuth()
    const hasProAccess = has?.({
        plan:"Pro"
    })

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [tabState, setTabState] = useState<"preview" |"code"> ("preview")

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
                        setIsGenerating = {setIsGenerating}
                    />
                </Suspense>
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel
                defaultSize={65}
                minSize={50}
                className="flex flex-col min-h-0"
                >
                <Tabs
                    className="flex flex-col h-full"
                    defaultValue="preview"
                    value={tabState}
                    onValueChange={(value) =>
                    setTabState(value as "preview" | "code")
                    }
                >
                    <div className="flex items-center gap-x-2 border-b px-2 py-1">
                    <TabsList className="rounded-md border">
                        <TabsTrigger value="preview" className="gap-1">
                        <EyeIcon className="size-4" />
                        Demo
                        </TabsTrigger>
                        <TabsTrigger value="code" className="gap-1">
                        <CodeIcon className="size-4" />
                        Code
                        </TabsTrigger>
                    </TabsList>

                    <div className="ml-auto flex items-center gap-2">
                        {!hasProAccess&& (<Button asChild size="sm" variant={"tertiary"}>
                        <Link href="/pricing">
                            <CrownIcon className="size-4 mr-1" />
                            Upgrade
                        </Link>
                        </Button>)}
                        <UserControl/>
                    </div>
                    </div>
                    
                    <TabsContent
                    value="preview"
                    className="flex-1 min-h-0 overflow-hidden"
                    >
                    {isGenerating ? (
                        <CodeGenerationLoader />
                    ) : !!activeFragment ? (
                        <FragmentWeb data={activeFragment} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Send a prompt to generate a preview.
                        </div>
                    )}
                    </TabsContent>

                    <TabsContent
                    value="code"
                    className="flex-1 min-h-0 overflow-hidden flex flex-col"
                    >
                    {isGenerating && (!activeFragment?.files || Object.keys(activeFragment.files as Record<string, string>).length === 0) ? (
                        <CodeGenerationLoader />
                    ) : !!activeFragment?.files ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            {isGenerating && (
                                <div className="p-2 bg-muted/50 border-b flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
                                    Generating files... 
                                </div>
                            )}
                            <FileExplorer
                                files={activeFragment.files as Record<string, string>}
                            />
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Code files will appear here after generation.
                        </div>
                    )}
                    </TabsContent>
                </Tabs>
            </ResizablePanel>

        </ResizablePanelGroup>
    </div>
  )
}
