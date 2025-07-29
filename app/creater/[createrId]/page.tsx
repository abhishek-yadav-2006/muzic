import StreamView from "@/app/components/StreamView"

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ createrId: string }>
}) {
  // Await the params Promise to get the actual values
  const { createrId } = await params

  return (
    <div>
      <StreamView createrId={createrId} playVideo={false} />
    </div>
  )
}
