import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterOtpModal from "@/components/Auth/RegisterOtpModal";
import { authService } from "@/services/authService";
import { useSnackbar } from "@/context/AlertProvider";
import { User, Mail, Lock } from "lucide-react";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredId, setRegisteredId] = useState<string>("");
  const { openSnackbar } = useSnackbar();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
      };

      const response = await authService.register(payload);
      const { id } = response.data;

      if (!id) {
        throw new Error("Invalid register response");
      }

      setRegisteredEmail(data.email);
      setRegisteredId(id);
      setOpenOtpModal(true);

      openSnackbar({
        message:
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác nhận.",
        severity: "success",
      });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      openSnackbar({
        message,
        severity: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-blue-600">
            Tạo tài khoản
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Họ và tên
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  {...register("fullName", {
                    required: "Họ và tên là bắt buộc",
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
                  placeholder="nguyen.vana@example.com"
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
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg shadow-md transition-all duration-200"
            >
              Đăng ký
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 pt-4">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardContent>
      </Card>

      <RegisterOtpModal
        open={openOtpModal}
        email={registeredEmail}
        registeredId={registeredId}
        onClose={() => setOpenOtpModal(false)}
      />
    </div>
  );
};

export default RegisterPage;
