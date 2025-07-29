"use client"

import {signIn, signOut, useSession} from "next-auth/react"

export function Appbar (){
    const session = useSession()
    return (
        <div className="flex justify-between px-20  bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="text-white flex flex-col justify-center" >
                Muzic
            </div>
            <div>
            {!session.data?.user && <button className="m-2 p-2 bg-blue-400"   onClick={()=> signIn()}>Signin</button> }    
            {session.data?.user && <button className="m-2 p-2 bg-blue-400"   onClick={()=> signOut()}>Logout</button> }    
            </div>
        </div>
    )
}