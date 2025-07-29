"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Share2, Users, Video } from "lucide-react"
import { useSession } from "next-auth/react"
import { ThumbsDown, ThumbsUp } from 'lucide-react';


import { toast } from "sonner"


const REFRESH_INTERVAL_MS = 10000;

function extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
}

function YouTubeEmbed({ videoid, height = 315, params = "" }: { videoid: string, height?: number, params?: string }) {
    const src = `https://www.youtube.com/embed/${videoid}?${params}`
    return (
        <iframe
            key={videoid}
            width="100%"
            height={height}
            src={src}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-lg"
        />
    )
}

interface Video {
    id: string;
    title: string;
    extractedId: string;
    url: string;
    smallImg: string;
    bigImg: string;
    duration?: string;
    submittedBy?: string;
    active: boolean
    upvotes: number;
    hasVoted: boolean;
}


interface StreamViewProps {
      createrId: string
  playVideo: boolean
}
 
const StreamView: React.FC<StreamViewProps> = ({ createrId, playVideo = false }) => {
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
    const [queue, setQueue] = useState<Video[]>([])
    const [currentSong, setCurrentSong] = useState<Video | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { status } = useSession()


    const filteredQueue = queue.filter((s) => currentSong?.id !== s.id)
    const sortedQueue = [...filteredQueue].sort((a, b) => b.upvotes - a.upvotes)


    const refreshStreams = async () => {
        try {
            const res = await fetch(`/api/streams/?createrId=${createrId}`, { credentials: "include" })
            const data = await res.json()
            setQueue(data.streams)
            setCurrentSong(Video => {

                if (Video?.id === data.activeStream?.stream?.id) {
                    return Video
                }
                return data.activeStream.stream
            })



        } catch (err) {
            console.error("Failed to refresh = ", err)
        }
    }

    useEffect(() => {
        refreshStreams()
        const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const vid = extractVideoId(youtubeUrl)
        setPreviewVideoId(vid)
    }, [youtubeUrl])

    const handleSubmitSong = async () => {

        setIsLoading(true);

        try {
            const res = await fetch("/api/streams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    url: youtubeUrl,
                    createrId: createrId
                })
            });



            if (res.ok) {
                setYoutubeUrl("");

                refreshStreams();
            }
        } catch (err) {
            console.error("Submit failed", err);
        } finally {
            setIsLoading(false);
        }
    };




    const handleShare = () => {
        const sharableLink = `${window.location.origin}/creater/${createrId}`
        navigator.clipboard
            .writeText(sharableLink)
            .then(() => {
                toast.success("Link Copied!", {
                    description: "The shareable link has been copied to your clipboard.",
                })
            })
            .catch((err) => {
                console.error("Clipboard copy failed:", err)
                toast.error("Failed to Copy Link", {
                    description: "Please copy the link manually.",
                })
            })
    }




    const handleVote = async (streamId: string, isUpvote: boolean) => {

        setQueue(prevQueue =>
            prevQueue.map(song =>
                song.id === streamId
                    ? {
                        ...song,
                        upvotes: song.hasVoted ? song.upvotes - 1 : song.upvotes + 1,
                        hasVoted: !song.hasVoted,
                    }
                    : song
            )
        );

        try {
            const endpoint = isUpvote ? "downvote" : "upvote";
            await fetch(`/api/streams/${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ streamId }),
            });
            refreshStreams();
        } catch (err) {
            console.error("Vote failed", err);
        }
    };

    const playNext = async () => {
        if (queue.length > 0) {
            const data = await fetch("/api/streams/next", {
                method: "GET",
                credentials: "include"

            })
            const json = await data.json()
            setCurrentSong(json.activeStream)
            setQueue(q => q.filter(x => x.id !== json.activeStream?.id))

        }

    }


    if (status === "loading") return <div className="text-white text-center mt-8">Loading session...</div>

    if (status === "unauthenticated") return (
        <div className="min-h-screen flex items-center justify-center text-white text-xl">
            Please sign in to view and interact with the song queue.
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-white">🎵 Stream Song Requests</h1>
                        <p className="text-purple-200">Vote for the next song or submit your own!</p>
                        <Button
                            onClick={handleShare}
                            variant="outline"
                            className="mt-4 text-white border-purple-500/30 hover:bg-purple-600/20 hover:text-white bg-transparent"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Stream
                        </Button>
                    </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">

                    <div className="space-y-6">

                        <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Play className="w-5 h-5 text-green-400" />
                                    Now Playing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentSong ? (
                                    <>

                                        {playVideo ? <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                            <YouTubeEmbed videoid={currentSong.extractedId} height={300} params="autoplay=1 & controls=1" />
                                        </div> : <img src={currentSong.bigImg} alt="" className=" mt-2  h-72 object-cover rounded" />}


                                        <div className="text-white">
                                            <h3 className="font-semibold text-lg">{currentSong.title}</h3>
                                            <p className="text-purple-200 text-sm">@{currentSong.submittedBy || "anonymous"}</p>
                                        </div>

                                    </>
                                ) : <p className="text-white">No song is playing</p>}
                            </CardContent>
                            {playVideo && <Button
                                onClick={playNext}
                                className="w-full mt-4  bg-green-600 hover:bg-green-700"
                                disabled={sortedQueue.length === 0}
                            >
                                Play Next Song
                            </Button>}
                        </Card>


                        <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Submit a Song
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Paste YouTube URL here..."
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300"
                                />

                                {previewVideoId && (
                                    <div className="space-y-3">
                                        <div className="aspect-video rounded-lg overflow-hidden">
                                            <img
                                                src={`https://img.youtube.com/vi/${previewVideoId}/mqdefault.jpg`}
                                                alt="Video preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSubmitSong}
                                            disabled={isLoading}
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                        >
                                            {isLoading ? "Adding to Queue..." : "Add to Queue"}
                                        </Button>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>


                    <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Song Queue ({sortedQueue.length})
                            </CardTitle>

                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {sortedQueue.length === 0 ? (
                                    <div className="text-center py-8 text-purple-300">
                                        <p>No songs in queue</p>
                                        <p className="text-sm">Be the first to add one!</p>
                                    </div>
                                ) : (
                                    sortedQueue.map((song, index) => (
                                        <div
                                            key={song.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-purple-500/20 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="text-purple-300 font-mono text-sm w-6">#{index + 1}</div>
                                            <img
                                                src={song.smallImg}
                                                alt={song.title}
                                                className="w-16 h-12 rounded object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium text-sm line-clamp-1">{song.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-purple-300">
                                                    <span>@{song.submittedBy || "unknown"}</span>
                                                    <span>•</span>
                                                    <span>{song.duration || "?"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-purple-600/20 text-purple-200">
                                                    <span>{song.upvotes > 0 ? song.upvotes : 0}</span>


                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleVote(song.id, song.hasVoted)}
                                                    className="text-white hover:bg-purple-600/20"
                                                >
                                                    {song.hasVoted ? <ThumbsDown /> : <ThumbsUp />}
                                                </Button>


                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


export default StreamView