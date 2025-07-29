import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"
import * as youtubesearchapi from "youtube-search-api";

import { getServerSession } from "next-auth";
const YT_REGEX =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(watch\?v=)?([\w\-]{11})/;

const CreateStreamSchema = z.object({
    createrId: z.string(),
    url: z.string()
})

const MAX_QUEUE_LEN = 20;


export async function POST(req: NextRequest) {
    const session = await getServerSession()
    console.log("endpoint reached")
    try {

        const data = CreateStreamSchema.parse(await req.json())
        console.log(data.createrId)

        const isYt = data.url.match(YT_REGEX)

        if (!isYt) {
            return NextResponse.json({
                message: "wrong url format"
            }, {
                status: 411
            })

        }

        

        const url = new URL(data.url);
        const extractedId = url.searchParams.get("v");

        if (!extractedId) {
            return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 411 });
        }


        const res = await youtubesearchapi.GetVideoDetails(extractedId)



        const title = res.title

        const thumbnails = res.thumbnail.thumbnails
        thumbnails.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1)


        const stream = await prismaClient.stream.create({
            data: {

                userId: data.createrId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: title ?? "can't find video",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fcat%2F&psig=AOvVaw2pLfLQhqrnjdPTFZ1JneOa&ust=1752662245891000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCPDH1ujVvo4DFQAAAAAdAAAAABAE",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fcat%2F&psig=AOvVaw2pLfLQhqrnjdPTFZ1JneOa&ust=1752662245891000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCPDH1ujVvo4DFQAAAAAdAAAAABAE"

            }

        });
        console.log("stream: ", stream)

        return NextResponse.json({
            message: "stream added",
            id: stream.id
        })
    } catch (e) {
        console.log("err: ", e)
        return NextResponse.json({

            message: "error while adding a stream"
        }, {
            status: 411
        })
    }
}


export async function GET(req: NextRequest) {
    const session = await getServerSession()

    const createrId = req.nextUrl.searchParams.get("createrId")


    if (!createrId) {
        return NextResponse.json({ message: "Missing createrId" }, { status: 400 });
    }

    if (!createrId) {
        return NextResponse.json({
            message: "errror"
        }, {
            status: 411
        })
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "errror"
        }, {
            status: 411
        })
    }

    const [streams, activeStream] = await Promise.all([await prismaClient.stream.findMany({
        where: {
            userId: createrId,
            played: false
        },
        include: {
            _count: {
                select: {
                    upvotes: true,
                },
            },
            upvotes: {
                where: {
                    userId: user.id
                },


            },

        },

    }), prismaClient.currStream.findFirst({
        where: {
            userId: createrId
        },
        include: {
            stream: true
        }
    })])




    return NextResponse.json({

        streams: streams.map(({ _count, upvotes: userVotes, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            hasVoted: userVotes.length > 0
        })),

        activeStream
    })

}