<<<<<<< HEAD
import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import AuthPage from "./auth/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();

  if (user) {
    return <div>{children}</div>;
  }

  return <AuthPage />;
=======
import React from "react";
import Link from "next/link";
import SingupPage from "./register/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SingupPage />
  );
>>>>>>> featured
};

export default AuthProvider;
