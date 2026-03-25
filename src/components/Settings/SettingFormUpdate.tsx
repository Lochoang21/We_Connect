import { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSnackbar } from "@/context/AlertProvider"
import { compressImage } from "@/lib/imageUtils"
import { cloudinaryService } from "@/services/postService"
import userService from "@/services/userService"
import type { User } from "@/types/auth"

type ProfileFormState = {
  name: string
  phone: string
  address: string
  image: string
  bio: string
}

interface SettingFormUpdateProps {
  user: User | null
  onSaved?: (user: User) => void
}

const mapUserToForm = (user: User | null): ProfileFormState => ({
  name: user?.name ?? "",
  phone: user?.phone ?? "",
  address: user?.address ?? "",
  image: user?.image ?? "",
  bio: user?.bio ?? "",
})

const toOptionalTrimmed = (value: string): string | undefined => {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

export const SettingFormUpdate = ({ user, onSaved }: SettingFormUpdateProps) => {
  const { showSnackbar } = useSnackbar()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<ProfileFormState>(mapUserToForm(user))
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setForm(mapUserToForm(user))
  }, [user])

  const userInitials = useMemo(() => {
    const value = form.name || user?.name || "U"
    return value
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [form.name, user?.name])

  const handleChange = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleResetImage = () => {
    setForm((prev) => ({ ...prev, image: user?.image ?? "" }))
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      showSnackbar("error", "Vui lòng chọn file ảnh hợp lệ")
      event.target.value = ""
      return
    }

    try {
      setIsUploading(true)
      const compressedFile = await compressImage(file, {
        maxWidth: 1080,
        maxHeight: 1080,
        quality: 0.85,
      })
      const imageUrl = await cloudinaryService.uploadImage(compressedFile)
      setForm((prev) => ({ ...prev, image: imageUrl }))
      showSnackbar("success", "Tải ảnh lên thành công")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload ảnh thất bại"
      showSnackbar("error", message)
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleCancel = () => {
    setForm(mapUserToForm(user))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.name.trim().length > 100) {
      showSnackbar("error", "Tên tối đa 100 ký tự")
      return
    }
    if (form.phone.trim().length > 20) {
      showSnackbar("error", "Số điện thoại tối đa 20 ký tự")
      return
    }
    if (form.address.trim().length > 255) {
      showSnackbar("error", "Địa chỉ tối đa 255 ký tự")
      return
    }
    if (form.bio.trim().length > 500) {
      showSnackbar("error", "Tiểu sử tối đa 500 ký tự")
      return
    }

    try {
      setIsSaving(true)
      const updatedUser = await userService.updateProfile({
        name: toOptionalTrimmed(form.name),
        phone: toOptionalTrimmed(form.phone),
        address: toOptionalTrimmed(form.address),
        image: toOptionalTrimmed(form.image),
        bio: toOptionalTrimmed(form.bio),
      })
      showSnackbar("success", "Cập nhật thông tin thành công")
      onSaved?.(updatedUser)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cập nhật thông tin thất bại"
      showSnackbar("error", message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground">Profile Details</h2>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">Avatar</Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage src={form.image} alt="Avatar" className="object-cover" />
              <AvatarFallback className="rounded-xl text-base font-bold">{userInitials}</AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handlePickImage}
                disabled={isUploading}
              >
                {isUploading ? "Đang tải ảnh..." : "Upload new photo"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetImage}
                disabled={isUploading}
              >
                Reset
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Allowed JPG, GIF or PNG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting-name">Name</Label>
          <Input
            id="setting-name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Your full name"
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting-phone">Phone</Label>
          <Input
            id="setting-phone"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="0123 456 789"
            maxLength={20}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting-address">Address</Label>
          <Input
            id="setting-address"
            value={form.address}
            onChange={(event) => handleChange("address", event.target.value)}
            placeholder="Your address"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting-bio">Bio</Label>
          <textarea
            id="setting-bio"
            value={form.bio}
            onChange={(event) => handleChange("bio", event.target.value)}
            placeholder="Tell everyone a little about you"
            rows={4}
            maxLength={500}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving || isUploading}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

export default SettingFormUpdate
