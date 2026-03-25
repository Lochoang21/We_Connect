import { API } from "./apiService"
import type { ApiResponse, UpdateProfileRequest, User } from "@/types/auth"

export const userAPI = {
  getUserById: (id: number | string) =>
    API.user.getUserById(id) as Promise<{ data: ApiResponse<User> }>,
  updateProfile: (data: UpdateProfileRequest) =>
    API.user.updateProfile(data) as Promise<{ data: ApiResponse<User> }>,
}

function getErrorMessage(error: unknown, fallback = "Loi khong xac dinh"): string {
  if (!error) return fallback
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message

  const axiosError = error as { response?: { data?: { message?: string } } }
  return axiosError.response?.data?.message ?? fallback
}

export const userService = {
  getUserById: async (id: number | string): Promise<User> => {
    try {
      const response = await userAPI.getUserById(id)
      return response.data.data
    } catch (error: unknown) {
      console.error("Get user by id error:", error)
      throw new Error(getErrorMessage(error, "Failed to get user detail"))
    }
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    try {
      const response = await userAPI.updateProfile(data)
      return response.data.data
    } catch (error: unknown) {
      console.error("Update profile error:", error)
      throw new Error(getErrorMessage(error, "Failed to update profile"))
    }
  },
}

export default userService
