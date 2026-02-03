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
import OTPInput from "@/components/FormInputs/OTPInput";
import { useSnackbar } from "@/context/AlertProvider";
import { authService } from "@/services/authService";
import { Stepper } from "@/components/ui/stepper";

const steps = [
  { title: "Đăng nhập", description: "Gửi mã kích hoạt" },
  { title: "Xác minh", description: "Nhập mã OTP" },
  { title: "Hoàn tất", description: "Kích hoạt hoàn tất" },
];

interface AccountActivationModalProps {
  open: boolean;
  email?: string;
  onClose?: () => void;
}

type Status = "success" | "error" | null;

const AccountActivationModal = ({
  open,
  email,
  onClose,
}: AccountActivationModalProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [otpValue, setOtpValue] = useState<string>("");
  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activationId, setActivationId] = useState<string | null>(null);
  const { openSnackbar } = useSnackbar();

  const handleClose = () => {
    setActiveStep(0);
    setOtpValue("");
    setStatus(null);
    setErrorMessage("");
    setActivationId(null);
    onClose?.();
  };

  const handleResend = async () => {
    try {
      if (!email) {
        setErrorMessage("Không tìm thấy email. Vui lòng nhập lại.");
        return;
      }

      setErrorMessage("");
      setOtpValue(""); // Reset OTP khi gửi lại

      const response = await authService.retryActive(email);
      const { id } = response.data;

      if (!id) {
        throw new Error("Không lấy được thông tin kích hoạt.");
      }

      setActivationId(id);
      setErrorMessage("");

      openSnackbar({
        message: "Đã gửi lại email kích hoạt. Vui lòng kiểm tra hộp thư.",
        severity: "info",
      });
      setActiveStep(1);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể gửi lại email kích hoạt. Vui lòng thử lại.";
      setErrorMessage(message);
      openSnackbar({ message, severity: "error" });
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otpValue.length !== 6) {
      setErrorMessage("Vui lòng nhập đủ 6 số trong mã xác thực.");
      return;
    }

    if (!activationId) {
      setErrorMessage(
        "Không tìm thấy thông tin kích hoạt. Vui lòng gửi lại email kích hoạt."
      );
      return;
    }

    try {
      const response = await authService.checkCode({
        id: activationId,
        code: otpValue,
      });

      if (!response.data.isBeforeCheck) {
        throw new Error("OTP verification failed");
      }

      setStatus("success");
      setActiveStep(2);
      openSnackbar({
        message: "Kích hoạt tài khoản thành công. Bạn có thể đăng nhập.",
        severity: "success",
      });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Mã kích hoạt không hợp lệ hoặc đã hết hạn.";
      setStatus("error");
      setErrorMessage(message);
      setActiveStep(2);
      openSnackbar({ message, severity: "error" });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="px-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email
                để kích hoạt tài khoản hoặc bấm vào nút bên dưới để gửi lại
                email kích hoạt.
              </p>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  value={email || ""}
                  disabled
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button variant="outline" onClick={handleClose} className="h-12">
                Đóng
              </Button>
              <Button onClick={handleResend} disabled={!email} className="h-12 bg-blue-600 hover:bg-blue-700">
                Resend
              </Button>
            </DialogFooter>
          </div>
        );

      case 1:
        return (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="px-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Nhập mã xác thực đã được gửi tới{" "}
                <span className="font-semibold">{email}</span>.
              </p>

              <div className="my-4">
                <OTPInput value={otpValue || ""} onChange={setOtpValue} />
              </div>

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
                  setOtpValue("");
                  setErrorMessage("");
                }}
                className="h-12"
              >
                Quay lại
              </Button>
              <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-700">Active</Button>
            </DialogFooter>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="px-6">
              {status === "success" ? (
                <div className="text-center py-8 space-y-4">
                  <h3 className="text-2xl font-semibold text-green-600">
                    ✓ Kích hoạt thành công
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Tài khoản của bạn đã được kích hoạt. Bạn có thể đóng cửa sổ
                    này và đăng nhập lại.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <h3 className="text-2xl font-semibold text-destructive">
                    ✗ Kích hoạt thất bại
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {errorMessage ||
                      "Không thể kích hoạt tài khoản. Vui lòng thử lại."}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="justify-center px-6 pb-6">
              <Button
                onClick={
                  status === "success" ? handleClose : () => setActiveStep(1)
                }
                className="h-12 min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                {status === "success" ? "Đóng" : "Thử lại"}
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
            Kích hoạt tài khoản
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

export default AccountActivationModal;