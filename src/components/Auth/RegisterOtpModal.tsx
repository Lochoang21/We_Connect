import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OTPInput from "@/components/FormInputs/OTPInput";
import { authService } from "@/services/authService";
import { useSnackbar } from "@/context/AlertProvider";
import { useNavigate } from "react-router-dom";

interface RegisterOtpModalProps {
  open: boolean;
  email?: string;
  registeredId?: string;
  onClose?: () => void;
}

const RegisterOtpModal = ({
  open,
  email,
  registeredId,
  onClose,
}: RegisterOtpModalProps) => {
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleClose = () => {
    setOtp("");
    setError("");
    onClose?.();
  };

  const handleConfirm = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số trong mã xác nhận.");
      return;
    }

    if (!registeredId) {
      setError("Không tìm thấy thông tin đăng ký. Vui lòng thử lại.");
      return;
    }

    try {
      const response = await authService.checkCode({
        id: registeredId,
        code: otp,
      });

      if (!response.data.isBeforeCheck) {
        throw new Error("OTP verification failed");
      }

      openSnackbar({
        message: "Xác nhận email thành công. Bạn có thể đăng nhập.",
        severity: "success",
      });

      handleClose();
      navigate("/login");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Mã code không hợp lệ hoặc đã hết hạn";

      setError(message);
      openSnackbar({
        message,
        severity: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-blue-600">
            Xác nhận email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mã xác nhận đã được gửi đến email{" "}
            <span className="font-semibold">{email}</span>. Vui lòng nhập mã 6
            số để hoàn tất đăng ký.
          </p>

          <div className="flex justify-center mb-2">
            <OTPInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (error) setError("");
              }}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} className="h-12">
            Hủy
          </Button>
          <Button onClick={handleConfirm} className="h-12 bg-blue-600 hover:bg-blue-700">Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterOtpModal;