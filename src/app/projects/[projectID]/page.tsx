import React from 'react'

interface Props { 
    params: Promise<{
        projectID : string;
    }>
}
    
const page = async ({params}: Props) => {
    const {projectID} = await params;

  return (
    <div>ProjectID</div>
  )
}

export default page