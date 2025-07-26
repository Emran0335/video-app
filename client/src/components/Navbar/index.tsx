import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import Image from "next/image";

const Navbar = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();
  const { data: user } = useGetCurrentLoggedInUserQuery();
  console.log("user", user);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 text-gray-900 md:px-8">
      <div className="w-full flex items-center gap-8">
        {isSidebarCollapsed ? (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="text-gray-800" />
          </button>
        ) : null}
        <div className="relative md:ml-32 h-min w-full md:w-[600px]">
          <Search className="absolute left-2 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-100" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded border-none bg-gray-200 py-2 pl-8 placeholder-gray-900 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
          />
        </div>
      </div>
      <div className="ml-4 h-min px-2 py-2 rounded-md">
        {user ? (
          <div className="flex items-center justify-around px-0 py-0">
            <h1 className="font-medium w-[140px]">{user.fullName}</h1>
            <Image
              src={user.avatar as string}
              alt={user.username}
              width={40}
              height={30}
              className="rounded-full border-2 border-gray-100 object-contain"
            />
          </div>
        ) : (
          <div className="flex bg-blue-400 w-[210px] h-full items-center justify-around relative">
            <Link
              href="/signIn"
              className="w-[100px] text-center cursor-pointer hover:text-white"
            >
              Sign in
            </Link>
            <div className="absolute h-10 bg-white text-gray-50 w-1"></div>
            <Link
              href="/signUp"
              className="w-[100px] text-center cursor-pointer hover:text-white"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
