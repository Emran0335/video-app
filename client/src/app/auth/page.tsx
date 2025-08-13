"use client";
import SignIn from "@/components/signIn";
import SignupPage from "@/components/signUp";
import React, { useState } from "react";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="mx-auto mt-24 max-w-lg rounded-md border border-gray-200 bg-white p-6 shadow">
      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setIsSignIn(true)}
          className={`flex-1 border-b-2 py-2 text-sm font-medium ${
            isSignIn
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignIn(false)}
          className={`flex-1 border-b-2 py-2 text-sm font-medium ${
            !isSignIn
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Create Account
        </button>
      </div>

      <div>
        {!isSignIn ? (
          <SignupPage isSignIn={isSignIn} toggle={() => setIsSignIn(true)} />
        ) : (
          <SignIn isSignIn={isSignIn} toggle={() => setIsSignIn(false)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
