import Image from "next/image";
import React from "react";
import logoImg from "@/assets/logo.png";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div
      className={`${className} flex items-center justify-center text-white w-full`}
    >
      <Image
        src={logoImg}
        alt="logo image"
        className="w-10 h-10 mr-2 inline-block"
      />
      <h1 className="text-2xl text-gray-400 uppercase">Streaming</h1>
    </div>
  );
};

export default Logo;
