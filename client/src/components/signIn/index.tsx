"use client";
import { useLoginUserMutation } from "@/state/api";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

type SignInProps = {
  isSignIn: boolean;
  toggle: () => void;
};

const SignIn = ({ isSignIn, toggle }: SignInProps) => {
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const response = await loginUser({
      email,
      password: password,
    });
    if (response.data && "accessToken" in response.data) {
      localStorage.setItem(
        "accessToken",
        (response.data as { accessToken: string }).accessToken
      );
    }
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const isFormValid = () => {
    if (password === confirmPassword) {
      return email && password;
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <label className="mb-1 block text-sm">Email</label>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={(e) => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button
        className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
          !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? "Signing..." : "Sign In"}
      </button>
      {isSignIn && (
        <div className="text-center">
          <button
            className="text-sm text-teal-600 hover:underline"
            onClick={() => toggle()}
          >
            Please Create Account First
          </button>
        </div>
      )}
    </form>
  );
};

export default SignIn;
