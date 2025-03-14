import Link from "next/link";
import React from "react";
import Logo from "./logo/Logo";
import Search from "./search/Search";
import Button from "../button/Button";
import Image from "next/image";

const Navbar = () => {
  const authStatus = false;
  const userData = null;
  return (
    <nav className="flex justify-between items-center p-4 border border-x-0 border-t-0 border-gray-700">
      <Link href="/">
        <Logo />
      </Link>
      <Search />
      {!authStatus && (
        <div>
          <Link href="/login">
            <Button className="bg-gray-400 hover:bg-gray-500 py-2 px-3 rounded cursor-pointer mr-1 transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] sm:w-auto">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gray-400 hover:bg-gray-500 py-2 px-3 rounded cursor-pointer mr-1 transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      )}
      {authStatus && userData && (
        <Link href="/channel/userData/username">
          <Image src={userData} alt="user data is getting" />
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
