import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import OTPInput from "@/components/FormInputs/OTPInput";
import { authService } from "@/services/authService";
import { Stepper } from "@/components/ui/stepper";

const steps = [
  { title: "Nhập Email", description: "Gửi mã xác nhận" },
  { title: "Xác minh & Đổi mật khẩu", description: "Tạo mật khẩu mới" },
  { title: "Hoàn tất", description: "Đổi mật khẩu thành công" },
];

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPasswordModal = ({ open, onClose }: ForgotPasswordModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [otpValue, setOtpValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    control,
    handleSubmit,
    watch,
    reset: resetForm,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const handleClose = () => {
    setActiveStep(0);
    setEmail("");
    setOtpValue("");
    setErrorMessage("");
    resetForm();
    onClose();
  };

  // Step 1: Submit email to receive OTP
  const handleEmailSubmit = async (data: FormData) => {
    try {
      setErrorMessage("");
      setOtpValue(""); // Reset OTP khi chuyển sang step tiếp

      const response = await authService.retryPassword(data.email);
      const { email: responseEmail } = response.data;

      if (!responseEmail) {
        throw new Error("Invalid forgot-password response");
      }

      setEmail(responseEmail);
      setActiveStep(1);
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Không thể gửi mã OTP";
      setErrorMessage(msg);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (data: FormData) => {
    try {
      if (otpValue.length !== 6) {
        setErrorMessage("Đề nghị nhập đủ mã OTP");
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        setErrorMessage("Mật khẩu không khớp");
        return;
      }

      setErrorMessage("");

      const response = await authService.changePassword({
        code: otpValue,
        email,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (!response.data.isBeforeCheck) {
        throw new Error("Change password verification failed");
      }

      setActiveStep(2);
    } catch (error) {
      setErrorMessage(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Không thể đổi mật khẩu"
      );
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-12">
            <div className="px-6 space-y-12">
              <p className="text-sm text-muted-foreground">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn mã xác nhận
                để đặt lại mật khẩu.
              </p>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Địa chỉ email không hợp lệ",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      autoFocus
                      className={error ? "h-12 bg-gray-50 border-destructive focus:bg-white" : "h-12 bg-gray-50 border-gray-200 focus:bg-white"}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
              />
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="outline" onClick={handleClose} className="h-12">
                Hủy
              </Button>
              <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-700">Gửi mã</Button>
            </DialogFooter>
          </form>
        );

      case 1:
        return (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="px-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Nhập mã gồm 6 chữ số đã được gửi tới <strong>{email}</strong>
              </p>

              <div className="my-4">
                <OTPInput value={otpValue || ""} onChange={setOtpValue} />
              </div>

              <h3 className="text-sm font-semibold mt-4 mb-2">Tạo mật khẩu mới</h3>

              <Controller
                name="newPassword"
                control={control}
                rules={{
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Mật khẩu mới</Label>
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      className={error ? "h-12 bg-gray-50 border-destructive focus:bg-white" : "h-12 bg-gray-50 border-gray-200 focus:bg-white"}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === newPassword || "Mật khẩu không khớp",
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</Label>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu mới"
                      className={error ? "h-12 bg-gray-50 border-destructive focus:bg-white" : "h-12 bg-gray-50 border-gray-200 focus:bg-white"}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
              />

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveStep(0);
                  setOtpValue(""); // Reset OTP khi quay lại
                  setErrorMessage("");
                }}
                className="h-12"
              >
                Quay lại
              </Button>
              <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-700">Đặt lại mật khẩu</Button>
            </DialogFooter>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="px-6">
              <div className="text-center py-8 space-y-4">
                <h3 className="text-2xl font-semibold text-green-600">
                  ✓ Thành công!
                </h3>
                <p className="text-base text-muted-foreground">
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập
                  với mật khẩu mới của mình.
                </p>
              </div>
            </div>
            <DialogFooter className="justify-center px-6 pb-6">
              <Button
                onClick={handleClose}
                className="h-12 min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                Đóng
              </Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-blue-600">
            Quên mật khẩu
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <Stepper steps={steps} currentStep={activeStep} showControls={false} />
        </div>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;