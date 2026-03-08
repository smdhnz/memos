"use client"

import { useState, Fragment } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, Check, Loader2 } from "lucide-react"
import { deleteMemo } from "@/lib/actions"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import type { Memo } from "@/lib/db/schema"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MemoListProps {
  memos: Memo[]
}

export function MemoList({ memos }: MemoListProps) {
  return (
    <div className="flex flex-col">
      {memos.map((memo, index) => (
        <Fragment key={memo.id}>
          <MemoItem memo={memo} isPriority={index < 3} />
          {index < memos.length - 1 && (
            <div className="w-full border-b border-border/80" />
          )}
        </Fragment>
      ))}
      {memos.length === 0 && (
        <div className="mx-4 mt-4 rounded-2xl border-2 border-dashed py-20 text-center text-sm text-muted-foreground">
          メッセージがありません
        </div>
      )}
    </div>
  )
}

function MemoItem({ memo, isPriority }: { memo: Memo; isPriority?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { isMobile, mounted } = useIsMobile()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteMemo(memo.id)
      toast.success("削除しました")
      setPopoverOpen(false)
    } catch {
      toast.error("削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  const triggerDelete = () => {
    if (isMobile) {
      if (confirm("このメッセージを削除しますか？")) {
        handleDelete()
      }
    } else {
      setPopoverOpen(true)
    }
  }

  return (
    <div className="group relative flex w-full max-w-full items-start gap-2 p-3 transition-all hover:bg-muted/10 sm:gap-4 sm:p-4">
      <div className="min-w-0 flex-1 space-y-2 overflow-hidden break-all">
        {memo.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            <ContentRenderer content={memo.content} />
          </div>
        )}

        {memo.imageUrls && memo.imageUrls.length > 0 && (
          <div className="scrollbar-hide no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pt-1 pb-2">
            {memo.imageUrls.map((url, i) => (
              <ImagePreview
                key={i}
                url={url}
                alt={`memo image ${i}`}
                priority={isPriority && i === 0}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        {!mounted ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={triggerDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2"
              align="end"
              side="bottom"
              sideOffset={10}
            >
              <div className="flex flex-col gap-2">
                <p className="px-1 text-center text-[11px] font-bold">
                  削除しますか？
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-lg px-3 text-[11px] font-bold"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-3 w-3" />
                  )}
                  削除
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}

function ImagePreview({
  url,
  alt,
  priority,
}: {
  url: string
  alt: string
  priority?: boolean
}) {
  const proxyUrl = `/api/blob?url=${encodeURIComponent(url)}`
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative h-32 w-fit shrink-0 overflow-hidden rounded-md border border-muted/20 bg-muted/5">
      {!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
      <Image
        src={proxyUrl}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "auto", height: "100%" }}
        className={cn(
          "transition-all duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        unoptimized
        priority={priority}
      />
    </div>
  )
}

function ContentRenderer({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="flex flex-col">
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).trim()
          return <CodeBlock key={i} code={code} />
        }

        const text = part.trim()
        if (!text) return null

        return (
          <div key={i} className="whitespace-pre-wrap">
            {text}
          </div>
        )
      })}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("コピーしました")
  }

  return (
    <div className="group/code relative my-1">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded border border-border bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <div className="no-scrollbar overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[13px] text-foreground">
        <pre className="leading-relaxed">
          <code className="inline-block min-w-full pr-12">{code}</code>
        </pre>
      </div>
    </div>
  )
}
