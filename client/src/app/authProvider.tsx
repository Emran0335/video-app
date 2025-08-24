import React from "react";
import Link from "next/link";
import SingupPage from "./register/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SingupPage />
  );
};

export default AuthProvider;
