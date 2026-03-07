import { auth } from "@/auth"
import { db } from "@/lib/db"
import { memos } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { Navbar } from "@/components/navbar"
import { MemoList } from "@/components/memo-list"
import { MemoInput } from "@/components/memo-input"

export default async function Home() {
  const session = await auth()

  const userMemos = await db.query.memos.findMany({
    where: eq(memos.userId, session?.user?.id ?? ""),
    orderBy: [asc(memos.createdAt)],
  })

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight">Memos</h1>
          <Navbar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6">
        <MemoList memos={userMemos} />
      </main>

      <footer className="sticky bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent p-4 pt-10">
        <div className="mx-auto max-w-3xl">
          <MemoInput />
        </div>
      </footer>
    </div>
  )
}
