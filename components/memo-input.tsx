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
import { compressImageClient } from "@/lib/image-client"

interface MemoInputProps {
  placeholder?: string
  onSuccess?: () => void
  autoFocus?: boolean
}

interface Attachment {
  file: File
  preview: string
}

export function MemoInput({
  placeholder = "メッセージを送信...",
  onSuccess,
  autoFocus,
}: MemoInputProps) {
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
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
    if (newFiles.length === 0) return
    const newAttachments = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setAttachments((prev) => [...prev, ...newAttachments])
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items
    const pastedFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile()
        if (file) pastedFiles.push(file)
      }
    }
    addFiles(pastedFiles)
  }

  function removeFile(index: number) {
    setAttachments((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  function moveFile(index: number, direction: "left" | "right") {
    const newIndex = direction === "left" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= attachments.length) return
    setAttachments((prev) => {
      const next = [...prev]
      ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
      return next
    })
  }

  async function handleSubmit() {
    if (!content.trim() && attachments.length === 0) return

    setLoading(true)
    const formData = new FormData()
    formData.append("content", content)

    try {
      const compressedBlobs = await Promise.all(
        attachments.map((a) => compressImageClient(a.file))
      )
      compressedBlobs.forEach((blob, i) => {
        formData.append(
          "files",
          blob,
          attachments[i].file.name.replace(/\.[^/.]+$/, "") + ".webp"
        )
      })

      await upsertMemo(formData)
      setContent("")
      attachments.forEach((a) => URL.revokeObjectURL(a.preview))
      setAttachments([])
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
    <div className="flex w-full flex-col gap-2 rounded-none border-x-0 border-t border-b-0 bg-background/80 p-2 pb-[calc(2.5rem+env(safe-area-inset-bottom))] shadow-sm backdrop-blur-sm transition-all focus-within:px-2 focus-within:py-2 focus-within:pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:border sm:p-2 dark:border-t-white/20">
      {attachments.length > 0 && (
        <div className="mt-1 ml-2 flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <div
              key={i}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border"
            >
              <Image
                src={a.preview}
                alt="preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => moveFile(i, "left")}
                  disabled={i === 0}
                  tabIndex={-1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => removeFile(i)}
                  tabIndex={-1}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => moveFile(i, "right")}
                  disabled={i === attachments.length - 1}
                  tabIndex={-1}
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
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          tabIndex={-1}
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
          type="button"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl shadow-sm transition-all active:scale-95"
          disabled={loading || (!content.trim() && attachments.length === 0)}
          onClick={handleSubmit}
          tabIndex={-1}
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
