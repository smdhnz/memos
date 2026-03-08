import { auth } from "@/auth"
import { db } from "@/lib/db"
import { memos } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { Navbar } from "@/components/navbar"
import { MemoList } from "@/components/memo-list"
import { MemoInput } from "@/components/memo-input"
import { Container } from "@/components/container"

export default async function Home() {
  const session = await auth()

  const userMemos = session?.user?.id
    ? await db.query.memos.findMany({
        where: eq(memos.userId, session.user.id),
        orderBy: [desc(memos.createdAt)],
      })
    : []

  return (
    <div className="flex h-[100dvh] w-full max-w-full flex-col overflow-hidden overscroll-none bg-background">
      <header className="z-50 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Memos</h1>
          <Navbar />
        </Container>
      </header>

      {/* flex-col-reverse を使用して下から表示 */}
      <main className="flex min-h-0 flex-1 flex-col-reverse overflow-x-hidden overflow-y-auto pt-6 pb-20">
        <Container className="px-3 sm:px-4">
          <MemoList memos={userMemos} />
        </Container>
      </main>

      <footer className="z-50 shrink-0 bg-background sm:p-4 sm:pt-0">
        <Container className="px-0 sm:px-4">
          <MemoInput />
        </Container>
      </footer>
    </div>
  )
}
