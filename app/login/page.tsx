import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <form
        action={async () => {
          "use server"
          await signIn("discord")
        }}
        className="w-full max-w-xs"
      >
        <Button
          size="lg"
          className="w-full font-bold shadow-sm"
          variant="default"
        >
          Discordでログイン
        </Button>
      </form>
    </div>
  )
}
