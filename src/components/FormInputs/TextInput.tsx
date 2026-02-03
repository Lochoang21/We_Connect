import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  name: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  icon?: React.ReactNode;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ onChange, value, name, type = "text", icon, className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          className={cn(
            "h-12 px-3 py-2 bg-[#E8E8E8] rounded-lg border-transparent",
            "hover:border-[#246AA3] focus:border-[#246AA3] focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-colors duration-200",
            icon && "pr-10",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
