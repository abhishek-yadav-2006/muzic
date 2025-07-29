"use client"

import StreamView from "../components/StreamView"

 




const createrId="40b06fbe-8666-4acf-8ce3-b7e4fe46fba5"
export default function Dashboard() {


    return (
       <StreamView  createrId={createrId} playVideo={true}/>
    )
}
