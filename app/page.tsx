import { auth } from "@/auth"
import { db } from "@/lib/db"
import { memos } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { Navbar } from "@/components/navbar"
import { MemoList } from "@/components/memo-list"
import { MemoInput } from "@/components/memo-input"
import { Container } from "@/components/container"

export default async function Home() {
  const session = await auth()

  const userMemos = session?.user?.id
    ? await db.query.memos.findMany({
        where: eq(memos.userId, session.user.id),
        orderBy: [asc(memos.createdAt)],
      })
    : []

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Memos</h1>
          <Navbar />
        </Container>
      </header>

      <main className="flex-1 pt-6">
        <Container>
          <MemoList memos={userMemos} />
        </Container>
      </main>

      <footer className="sticky bottom-0 z-50 w-full bg-gradient-to-t from-background via-background to-transparent p-0 sm:p-4 sm:pt-10">
        <Container className="px-0 sm:px-4">
          <MemoInput />
        </Container>
      </footer>
    </div>
  )
}
