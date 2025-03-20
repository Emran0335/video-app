import React from "react";
import Logo from "../navbar/logo/Logo";
import Link from "next/link";
import Input from "../Input";
import Button from "../button/Button";

const LoginComponent = () => {
  return (
    <div className="w-full bg-[#121212] text-white flex-1 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-sm border px-4 p-8 w-full border-gray-600 rounded-lg shadow-lg">
        <div className="mx-auto inline-block w-full">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <p className="my-4 text-center text-xl font-semibold">Log in to your account</p>
        <form action="login" className="mt-2 px-4 flex flex-col gap-4">
          <Input className="rounded-lg" className2="px-0"/>
          <Input className="rounded-lg" className2="px-0"/>
          <Button type="submit" bgColor="bg-pink-800" className="rounded-lg disabled:cursor-not-allowed">
            Sign in
          </Button>
        </form>
        <h6 className="mx-auto mt-4 w-full text-center">
          Don&apos;t have an account yet?
          <Link
            href="/signup"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign up now
          </Link>
        </h6>
      </div>
    </div>
  );
};

export default LoginComponent;
