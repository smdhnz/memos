"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ImagePlus,
  Send,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { upsertMemo } from "@/lib/actions"
import { toast } from "sonner"
import Image from "next/image"

interface MemoInputProps {
  placeholder?: string
  onSuccess?: () => void
  autoFocus?: boolean
}

async function compressImageClient(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          } else {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Compression failed"))
          },
          "image/webp",
          0.8
        )
      }
    }
    reader.onerror = reject
  })
}

export function MemoInput({
  placeholder = "メッセージを送信...",
  onSuccess,
  autoFocus,
}: MemoInputProps) {
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function addFiles(newFiles: File[]) {
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items
    const pastedFiles: File[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) pastedFiles.push(file)
      }
    }

    if (pastedFiles.length > 0) {
      addFiles(pastedFiles)
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previews[index])
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function moveFile(index: number, direction: "left" | "right") {
    const newIndex = direction === "left" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= files.length) return

    const newFiles = [...files]
    const newPreviews = [...previews]

    ;[newFiles[index], newFiles[newIndex]] = [
      newFiles[newIndex],
      newFiles[index],
    ]
    ;[newPreviews[index], newPreviews[newIndex]] = [
      newPreviews[newIndex],
      newPreviews[index],
    ]

    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  async function handleSubmit() {
    if (!content.trim() && files.length === 0) return

    setLoading(true)
    const formData = new FormData()
    formData.append("content", content)

    try {
      // クライアント側で一括圧縮
      const compressedBlobs = await Promise.all(
        files.map((file) => compressImageClient(file))
      )

      compressedBlobs.forEach((blob, i) => {
        formData.append(
          "files",
          blob,
          files[i].name.replace(/\.[^/.]+$/, "") + ".webp"
        )
      })

      await upsertMemo(formData)
      setContent("")
      previews.forEach((p) => URL.revokeObjectURL(p))
      setFiles([])
      setPreviews([])
      onSuccess?.()
    } catch (e) {
      toast.error("送信に失敗しました")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-none border-x-0 border-b-0 bg-background/80 p-2 pb-[calc(2.5rem+env(safe-area-inset-bottom))] shadow-sm backdrop-blur-sm transition-all focus-within:ring-1 focus-within:ring-ring sm:rounded-2xl sm:border sm:pb-2">
      {previews.length > 0 && (
        <div className="mt-1 ml-2 flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div
              key={i}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border"
            >
              <Image src={url} alt="preview" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => moveFile(i, "left")}
                  disabled={i === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => moveFile(i, "right")}
                  disabled={i === previews.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none border-none bg-transparent px-1 py-2.5 text-base leading-relaxed shadow-none focus-visible:ring-0 sm:text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl transition-all"
          disabled={loading || (!content.trim() && files.length === 0)}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
