import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import {ProjectView} from '@/modules/projects/ui/views/project-view';
import React, { Suspense } from 'react'

interface Props { 
    params: Promise<{
        projectID : string;
    }>
}
    
const page = async ({params}: Props) => {
  const {projectID} = await params;
  const queryClient =  getQueryClient()

  void queryClient.prefetchQuery(trpc.messages.getmany.queryOptions({
    projectID,
  }))

  void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
    id: projectID
  }))
  return (
    <HydrationBoundary state= {dehydrate(queryClient)}>
        

        <Suspense fallback={<p>Loading...</p>}>
            <ProjectView projectID={projectID} />

        </Suspense>
    </HydrationBoundary>
  )     
}

export default page