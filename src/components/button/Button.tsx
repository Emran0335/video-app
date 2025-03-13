import React, { ReactNode } from "react";

interface ButtonProps {
  className?: string;
  bgColor?: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  className,
  bgColor,
  children,
  ...rest
}) => {
  return (
    <button className={`${className} ${bgColor}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
