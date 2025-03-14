import Link from "next/link";
import React from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { BiLike } from "react-icons/bi";
import { BsCollectionPlay } from "react-icons/bs";
import { GoDeviceCameraVideo, GoHistory, GoHome } from "react-icons/go";

const Sidebar = () => {
  const NavElements = [
    {
      name: "Home",
      route: "/",
      icon: <GoHome className="w-6 h-6" />,
    },
    {
      name: "Tweets",
      route: "/tweets",
      icon: <AiOutlineMessage className="w-6 h-6" />,
    },
    {
      name: "Liked videos",
      route: "/liked-videos",
      icon: <BiLike className="w-6 h-6" />,
    },
    {
      name: "History",
      route: "/history",
      icon: <GoHistory className="w-6 h-6" />,
    },
    {
      name: "Subscriptions",
      route: "/subscriptions",
      icon: <BsCollectionPlay className="w-6 h-6" />,
    },
    {
      name: "My Channel",
      route: `/channel/userData?.username`,
      icon: <GoDeviceCameraVideo className="w-6 h-6" />,
    },
  ];
  return (
    <div className="flex bg-black text-white h-full flex-col border border-y-0 border-l-0 border-gray-700 transition-all duration-100 ease-in-out">
      <ul className="grow px-2 py-1 flex flex-col gap-12">
        {NavElements.map((navItem, index) => (
          <li key={index} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 transition-all duration-100 cursor-pointer rounded-lg">
            <span>{navItem.icon}</span>
            <Link href={navItem.route}>{navItem.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
