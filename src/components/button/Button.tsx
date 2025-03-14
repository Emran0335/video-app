import React, { ReactNode } from "react";

interface ButtonProps {
  className?: string;
  bgColor?: string;
  textColor?:string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  className,
  bgColor,
  children,
  type="button",
  textColor="text-white",
  ...props
}) => {
  return (
    <button
      className={`px-4 py-1 ${className} ${textColor} ${bgColor}`}
      {...props}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
