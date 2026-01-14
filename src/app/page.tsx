"use client"

import { useTRPC } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"


const Page =  () => {
  const [value, setValue] = useState("")
  
  const trpc = useTRPC()

  const messages = useQuery(trpc.messages.getmany.queryOptions())
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () =>{
      toast.success("Message created!")
    }
  }))

  
  
  return ( 
    <div>

      <Input value={value} onChange={(e)=>setValue(e.target.value)} />
      <Button disabled={createMessage.isPending} onClick={() => createMessage.mutate({content: value})}>
        Create Message
      </Button>
      
      {JSON.stringify(messages.data, null ,2 )}

    </div>
  )
}

export default Page