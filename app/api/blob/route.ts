import { get } from "@vercel/blob"
import { auth } from "@/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) {
    return new Response("URL is required", { status: 400 })
  }

  try {
    const result = await get(blobUrl, {
      access: "private",
    })

    if (!result) {
      return new Response("Not found", { status: 404 })
    }

    if (result.statusCode === 304) {
      return new Response(null, { status: 304 })
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Blob proxy error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
