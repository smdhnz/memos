"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="テーマ切り替え"
        tabIndex={-1}
      >
        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut()}
        aria-label="ログアウト"
        tabIndex={-1}
      >
        <LogOut className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
      </Button>
    </div>
  )
}
