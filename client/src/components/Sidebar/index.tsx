"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  History,
  Home,
  LockIcon,
  LogOut,
  LucideIcon,
  SquarePlay,
  StickyNote,
  UserCog,
  Video,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../../public/logo.png";
import {
  useGetCurrentLoggedInUserQuery,
  useLogoutUserMutation,
} from "@/state/api";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const { data: user } = useGetCurrentLoggedInUserQuery();
  const dispatch = useAppDispatch();
  const { isSidebarCollapsed } = useAppSelector((state) => state.global);
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const handleLogout = async () => {
    const response = await logoutUser();
    localStorage.removeItem("accessToken");

    if (!("error" in response)) {
      window.location.href = "/"; // ⬅️ Forces a full reload to "/"
    }
  };

  const sidebarClassNames = `fixed flex-col justify-between min-h-screen text-gray-800 shadow-xl bg-white transition-all duration-300 z-40 overflow-y-auto mb-0 ${
    isSidebarCollapsed ? "w-0 hidden" : "w-64"
  }`;

  return (
    <div className={sidebarClassNames}>
      <div className="w-full h-[100vh] flex flex-col justify-between">
        <div className="flex h-[100%] w-full flex-col justify-start">
          {/* TOP LOGO  */}
          <div className="z-50 flex min-h-[80px] w-full items-center justify-between bg-white px-6 pt-3">
            <div className="text-xl font-bold text-gray-800">
              {user?.username.toUpperCase()}
            </div>
            {isSidebarCollapsed ? null : (
              <button
                onClick={() =>
                  dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
                }
              >
                <X className="text-gray-800" />
              </button>
            )}
          </div>
          {/* TEAM  */}
          <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-4 py-4">
            <Image src={logo} alt="logo" width={40} height={40} />
            <div>
              <h3 className="font-semibold tracking-wide">VIDEO STREAM</h3>
              <div className="flex items-start gap-2">
                <LockIcon className="mt-[0.1rem] h-3 w-3" />
                <p className="text-xs text-gray-900">Private</p>
              </div>
            </div>
          </div>
          {/* NAVBAR LINKS  */}
          <nav className="z-10 w-full">
            <SidebarLink href="/" label="Home" icon={Home} />
            <SidebarLink href="/tweets" label="Tweets" icon={StickyNote} />
            <SidebarLink
              href="/liked-videos"
              label="Liked-videos"
              icon={Video}
            />
            <SidebarLink href="/history" label="History" icon={History} />
            <SidebarLink
              href="subscriptions"
              label="Subscriptions"
              icon={Youtube}
            />
            <SidebarLink
              href={`/channel/${user?.username}`}
              label="My Channel"
              icon={SquarePlay}
            />
            <SidebarLink href="/admin/dashboard" label="Admin" icon={UserCog} />
          </nav>
        </div>
        <button
          className="font-medium text-xl mb-16 py-3 flex justify-start items-center px-8 gap-4 w-full text-gray-800 hover:bg-gray-200 hover:text-red-500"
          onClick={handleLogout}
        >
          <LogOut className="w-8 h-8 border border-gray-400 rounded-full p-1" />
          Sign out
        </button>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 ${
          isActive ? "text-gray-800 bg-white" : ""
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-[5px] bg-blue-500" />
        )}
        <Icon className="h-6 w-6 text-gray-800" />
        <span className={`font-medium text-gray-800`}>{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;
