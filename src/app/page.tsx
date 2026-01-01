"use client"

import { useTRPC } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"


const Page =  () => {
  const [value, setValue] = useState("")
  
  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () =>{
      toast.success("Background job invoked!")
    }
  }))
  
  return ( 
    <div>

      <Input value={value} onChange={(e)=>setValue(e.target.value)} />
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({value: value})}>
        Invoke Background Job
      </Button>
    </div>
  )
}

export default Page