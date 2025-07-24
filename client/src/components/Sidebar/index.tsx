"use client"

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import logo from "../../../public/logo.png";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const dispatch = useAppDispatch();
  const {isSidebarCollapsed} = useAppSelector(
    (state) => state.global
  );

  const sidebarClassNames = `fixed flex-col h-[100%] text-gray-900 justify-between shadow-xl bg-white transition-all duration-300 z-40 overflow-y-auto ${
    isSidebarCollapsed? "w-0 hidden" : "w-64"
  }`;
  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO  */}
        <div className="z-50 flex min-h-[56px] w-full items-center justify-between bg-white px-6 pt-3">
          <div className="text-xl font-bold text-gray-800">
            Emran
          </div>
          {isSidebarCollapsed ? null : (
            <button
              onClick={() =>
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
              }
            >
              <X className="text-gray-800"/>
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
          <SidebarLink href="/timeline" label="Timeline" icon={Briefcase} />
          <SidebarLink href="/search" label="Search" icon={Search} />
          <SidebarLink href="/settings" label="Settings" icon={Settings} />
          <SidebarLink href="/users" label="Users" icon={User} />
          <SidebarLink href="/teams" label="Teams" icon={Users} />
        </nav>
        {/* PROJECTS LINKS  */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Projects</span>
          {showProjects ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>
        {/* PROJECTS LIST  */}

        {/* PRIORITY LINKS  */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Priority</span>
          {showPriority ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>
        {/* PRIORITY LIST  */}
        {showPriority && (
          <>
            <SidebarLink
              href="/priority/urgent"
              label="Urgent"
              icon={AlertCircle}
            />
            <SidebarLink
              href="/priority/high"
              label="High"
              icon={ShieldAlert}
            />
            <SidebarLink
              href="/priority/medium"
              label="Medium"
              icon={AlertTriangle}
            />
            <SidebarLink href="/priority/low" label="Low" icon={AlertOctagon} />
            <SidebarLink
              href="/priority/backlog"
              label="Backlog"
              icon={Layers3}
            />
          </>
        )}
      </div>
      <div className="z-10 mt-32 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 dark:bg-black md:hidden">
        <div className="flex w-full items-center">
          <div className="flex h-9 w-9 items-center justify-center"></div>
          <span className="mx-3 text-gray-800"></span>
          <button className="self-start rounded bg-blue-400 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-blue-500 md:block">
            Sign out
          </button>
        </div>
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
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-800 text-white" : ""
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
