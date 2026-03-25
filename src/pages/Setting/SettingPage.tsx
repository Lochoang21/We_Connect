import { useEffect } from "react"
import SettingFormUpdate from "@/components/Settings/SettingFormUpdate"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchUserProfile } from "@/redux/slices/authSlice"

export function SettingPage() {
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, user])

  const refreshProfile = () => {
    dispatch(fetchUserProfile())
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account Settings</h1>
      </div>

      {status === "loading" && !user ? (
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Đang tải thông tin tài khoản...
        </div>
      ) : (
        <SettingFormUpdate user={user} onSaved={refreshProfile} />
      )}
    </div>
  )
}

export default SettingPage
