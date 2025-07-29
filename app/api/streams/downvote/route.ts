import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {  z } from "zod"

const downvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
         
            email: session?.user?.email ?? ""
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "unauthenticated "
        }, {
            status: 403
        })
    }

    try {
        const data = downvoteSchema.parse(await req.json())
        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId,
                },
            },
        });


         return NextResponse.json({
            message: "Downvote successful"
        }, {
            status: 200
        });
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: "error whie upvorting "
            
        }, {
            status: 403
        })
    }
}



export async function GET(req: NextRequest) {

    const createrId = req.nextUrl.searchParams.get("createrId")
    const streams = await prismaClient.stream.findMany({
        where: {
          
            userId: createrId  ?? ""
        }
    })
    return NextResponse.json({
        streams
    })
}
