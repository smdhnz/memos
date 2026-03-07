import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isAuth = !!req.auth
  const isLoginPage = req.nextUrl.pathname === "/login"

  // 未ログインでログインページ以外にアクセスした場合、/login へ
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }

  // ログイン済みでログインページにアクセスした場合、トップページへ
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }
})

export const config = {
  // すべてのページを Proxy の対象にするが、matcher で除外設定を行う
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
