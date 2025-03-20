import React from "react";
import Logo from "../navbar/logo/Logo";
import Link from "next/link";
import Input from "../Input";
import Button from "../button/Button";

const SignupComponent = () => {
  return (
    <div className="w-full bg-[#121212] text-white flex-1 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-[450px] border px-4 p-8 w-full border-gray-600 rounded-lg shadow-lg">
        <div className="mx-auto inline-block w-full">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <p className="my-4 text-center text-xl font-semibold">
          Create an account
        </p>
        <h6 className="mx-auto mt-4 w-full text-center">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign in now
          </Link>
        </h6>
        <form action="login" className="mt-2 px-4 flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            className="rounded-lg"
            className2="px-0"
          />
          <Input
            label="Username"
            type="text"
            className="rounded-lg"
            className2="px-0"
          />
          <Input
            label="Email Address"
            type="email"
            className="rounded-lg"
            className2="px-0"
          />
          <Input
            label="Password"
            type="password"
            className="rounded-lg"
            className2="px-0"
          />
          <Input
            label="Avatar"
            type="file"
            className="rounded-lg"
            className2="px-0"
          />
          <Input
            label="Cover Image"
            type="file"
            className="rounded-lg"
            className2="px-0"
          />
          <Button
            type="submit"
            bgColor="bg-pink-800"
            className="rounded-lg disabled:cursor-not-allowed"
          >
            Sign up
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignupComponent;
