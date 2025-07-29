import React from "react";
import { Menu, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import Image from "next/image";

const Navbar = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();
  const { data: user } = useGetCurrentLoggedInUserQuery();

  return (
    <div className="flex w-full h-[80px] items-center justify-between bg-white px-2 py-3 text-gray-900 md:px-8">
      <div className={`w-full flex items-center justify-between ${isSidebarCollapsed ? "" : "flex items-center justify-center ml-48"}`}>
        {isSidebarCollapsed && (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            className="w-8"
          >
            <Menu className="text-gray-800" />
          </button>
        )}
        <div className="relative mr-48 h-min w-full hidden md:w-[600px] md:block">
          <Search className="absolute left-2 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-900" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded border-none bg-gray-100 py-2 pl-8 placeholder-gray-800 focus:border-transparent focus:outline-none shadow-lg"
          />
        </div>
      </div>
      <div className="h-full w-[400px] px-2 py-2 rounded-md flex items-center justify-end">
        {user && (
          <>
            <h1 className="font-medium w-[170px] hidden md:block">
              {user.fullName}
            </h1>
            <div className="w-[32px] h-[32px] rounded-full overflow-hidden">
              <Image
              src={user.avatar as string}
              alt={user.username}
              width={40}
              height={40}
              className="object-cover"
            />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
