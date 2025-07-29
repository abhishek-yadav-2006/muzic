"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export  function  Redirect(){
    const session = useSession()
    const router = useRouter()
    useEffect(()=>{
       if(session.data?.user){
        router.push("/Dashboard")
       }

    }, [session, router])

    useEffect(()=>{
        if(!session.data?.user){
            router.push("/")
        }
    }, [session, router])
    return null
}