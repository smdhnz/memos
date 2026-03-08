"use server"

import { db } from "@/lib/db"
import { memos } from "@/lib/db/schema"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { eq, and } from "drizzle-orm"
import sharp from "sharp"

/**
 * サーバー側で画像をWebPに変換し、Blobに保存する
 */
async function processAndUploadImage(file: File): Promise<string> {
  if (file.size === 0) return ""

  const buffer = Buffer.from(await file.arrayBuffer())
  const compressedBuffer = await sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .rotate()
    .webp({ quality: 80 })
    .toBuffer()

  const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`
  const { url } = await put(`memos/${fileName}`, compressedBuffer, {
    access: "private",
    contentType: "image/webp",
  })
  return url
}

export async function upsertMemo(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = formData.get("id") as string | null
  const content = formData.get("content") as string
  const files = formData.getAll("files") as File[]
  const existingImageUrls = (formData.getAll("imageUrls") as string[]) || []

  // 順序を維持して画像を処理
  const newImageUrls = await Promise.all(
    files.map((file) => processAndUploadImage(file))
  )

  const imageUrls = [...existingImageUrls, ...newImageUrls].filter(Boolean)

  if (id) {
    await db
      .update(memos)
      .set({
        content,
        imageUrls,
        updatedAt: new Date(),
      })
      .where(and(eq(memos.id, id), eq(memos.userId, session.user.id)))
  } else {
    await db.insert(memos).values({
      content,
      imageUrls,
      userId: session.user.id,
    })
  }

  revalidatePath("/")
}

export async function deleteMemo(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const memo = await db.query.memos.findFirst({
    where: and(eq(memos.id, id), eq(memos.userId, session.user.id)),
  })

  if (!memo) throw new Error("Memo not found")

  // 全画像を Blob から削除
  if (memo.imageUrls && memo.imageUrls.length > 0) {
    await Promise.all(
      memo.imageUrls.map(async (url) => {
        try {
          await del(url)
        } catch (e) {
          console.error("Failed to delete blob:", e)
        }
      })
    )
  }

  await db
    .delete(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, session.user.id)))

  revalidatePath("/")
}
