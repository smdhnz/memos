import { useState, useEffect } from "react"

/**
 * モバイル端末であるかどうかと、ハイドレーションが完了したかどうかを判定するフック
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // ハイドレーションエラーを回避するために、クライアントサイドでのマウント後に状態を更新する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      )
    }

    checkMobile()
  }, [])

  return { isMobile, mounted }
}
