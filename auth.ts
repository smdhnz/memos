import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { env } from "@/lib/env"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.id) return false
      const allowedIds = env.ALLOWED_USER_IDS.split(",")
      if (allowedIds.includes(profile.id as string)) {
        return true
      }
      return false
    },
    async jwt({ token, profile }) {
      // ログイン時に Discord の ID (profile.id) をトークンに保存
      if (profile?.id) {
        token.sub = profile.id as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // トークンの sub (Discord ID) をセッションのユーザー ID として使用
        session.user.id = token.sub
      }
      return session
    },
  },
})
