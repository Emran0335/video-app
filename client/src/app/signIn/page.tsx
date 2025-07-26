"use client";
import { useLoginUserMutation, useRegisterUserMutation } from "@/state/api";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignIn = () => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(true);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;

    const response = await loginUser({
      email,
      password,
    });
    console.log("User logged IN", response.data);
    if (response.data && "accessToken" in response.data) {
      localStorage.setItem(
        "accessToken",
        (response.data as { accessToken: string }).accessToken
      );
    }

    if (!("error" in response)) {
      // ✅ Navigate to login page on success
      router.push("/");
    }

    // Reset form
    setEmail("");
    setPassword("");
  };

  const isFormValid = () => {
    return email && password;
  };
  const onClose = () => {
    setIsModalNewTaskOpen((prev) => !prev);
    router.push("/");
  };
  return (
    <Modal name="Create New Task" isOpen={isModalNewTaskOpen} onClose={onClose}>
      <form
        className="mx-auto mt-2 flex flex-col max-w-sm px-4 text-gray-900"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="email"
          className="px-2 rounded-lg border py-1 mb-2"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="px-2 rounded-lg border py-1 mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
        <div className="flex items-center justify-center mt-4">
          <p className="text-gray-600">
            Don&apos;t have an Account yet?
            <Link href={"/signUp"} className="text-red-400 cursor-pointer">
              {" "}
              Please Sign Up now
            </Link>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default SignIn;
