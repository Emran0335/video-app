import React from "react";
import Link from "next/link";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = true;
  return (
    <div>
      {user ? (
        <div>{children}</div>
      ) : (
        <Link href={"/register"}>Please sign up first</Link>
      )}
    </div>
  );
};

export default AuthProvider;
