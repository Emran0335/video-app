"use client";

import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import { useState } from "react";
import SignupPage from "./signUp/page";
import SignIn from "./signIn/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();

  const [toggleSignUser, setToggleSignUser] = useState(false);

  if (user) {
    return <div>{children}</div>;
  }

  const changeSignUser = () => {
    setToggleSignUser((prev) => !prev);
  };

  return toggleSignUser ? (
    <SignupPage setToggleSignUser={changeSignUser} />
  ) : (
    <SignIn setToggleSignUser={changeSignUser} />
  );
};

export default AuthProvider;
