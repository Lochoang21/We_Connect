/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/redux/slices/authSlice";
import type { LoginResponse } from "@/types/auth";
import { useSnackbar } from "@/context/AlertProvider";
import ForgotPasswordModal from "@/components/Auth/ForgotPasswordModal";
import AccountActivationModal from "@/components/Auth/AccountActivationModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import { Mail, Lock, Facebook } from "lucide-react";

// Types
interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, errorCode } = useAppSelector((state) => state.auth);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [openActivationModal, setOpenActivationModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { openSnackbar } = useSnackbar();

  const emailValue = watch("email");

  const onSubmit = async (data: LoginFormData) => {
    const payload = { username: data.email, password: data.password };
    const result = await dispatch(login(payload) as any);
    console.log("Login result:", result);
    if (login.fulfilled.match(result)) {
      const user = (result.payload as LoginResponse | undefined)?.user;
      const isInactive =
        user?.active === 0 ||
        user?.isActive === false ||
        user?.is_active === 0 ||
        user?.status === 0 ||
        user?.is_active === false;

      if (isInactive) {
        setOpenActivationModal(true);
        return;
      }

      // openSnackbar({ message: "Login successfully", severity: "success" });
      navigate("/");
    }
  };

  useEffect(() => {
    if (status === "failed" && error) {
      if (errorCode === 2) {
        // Use setTimeout to avoid cascading renders
        setTimeout(() => setOpenActivationModal(true), 0);
      } else {
        openSnackbar({ message: error, severity: "error" });
      }
    }
  }, [status, error, errorCode, openSnackbar]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-blue-600">
            Chào mừng trở lại
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email.example@gmail.com"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-gray-600 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setOpenForgotPassword(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg shadow-md transition-all duration-200"
            >
              {status === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-4">
            {/* Facebook */}
            <button
              type="button"
              onClick={() => console.log("Facebook login")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 group"
            >
              <Facebook className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>

            {/* Twitter */}
            <button
              type="button"
              onClick={() => console.log("Twitter login")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => console.log("Google login")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => console.log("Apple login")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 pt-4">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Modals */}
      <ForgotPasswordModal
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
      />

      <AccountActivationModal
        open={openActivationModal}
        onClose={() => setOpenActivationModal(false)}
        email={emailValue}
      />
    </div>
  );
};

export default LoginPage;