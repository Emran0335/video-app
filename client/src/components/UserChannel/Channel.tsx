"use client";
import React, { useState } from "react";
import {
  useGetCurrentLoggedInUserQuery,
  useGetUserChannelProfileQuery,
} from "@/state/api";
import Image from "next/image";
import { Bell, CheckCircle, Edit } from "lucide-react";
import Modal from "../Modal";
import SignInModal from "../UserModal/SignInModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ChannelProps = {
  username: string;
  children: React.ReactNode;
};

const Channel = ({ username, children }: ChannelProps) => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const { data: user } = useGetCurrentLoggedInUserQuery();
  const { data: userProfile } = useGetUserChannelProfileQuery(
    {
      username: username,
    },
    { skip: !username }
  );

  const router = useRouter();
  return (
    userProfile && (
      <section className="relative w-6xl mx-auto pb-[70px] sm:ml-[ml-70] text-gray-600">
        <div className="relative min-h-[150px] w-full xl:ml-4">
          <Image
            src={userProfile.coverImage as string}
            alt={userProfile.username}
            width={100}
            height={100}
            className="object-cover"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <div className="">
          <div className="flex flex-wrap gap-4">
            <div className="w-32 h-32 shrink-0 overflow-hidden rounded-full border-2">
              <Image
                src={userProfile.avatar as string}
                alt={userProfile.username}
                width={100}
                height={100}
                className="object-cover h-full w-full"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="">
              <h1 className="font-bold text-xl">{userProfile.fullName}</h1>
              <p className="text-sm text-gray-600">@{userProfile.username}</p>
              <p className="text-sm text-gray-600">
                {userProfile.subscribersCount} subscribers .{" "}
                {userProfile.channelsSubscribedToCount} subscribed
              </p>
            </div>
            <div className="">
              {user ? (
                user.username === userProfile.username ? (
                  <button
                    onClick={() => router.push("/settings")}
                    className="flex items-center font-semibold py-1 px-2 transition-all duration-150 ease-in-out active:translate-x-1 active:translate-y-1 rounded-md hover:bg-pink-600"
                  >
                    <Edit className="h-4 w-4"/>
                    <p className="ml-2 font-semibold">Edit</p>
                  </button>
                ) : (
                  <button>
                    {userProfile.isSubscribed ? (
                      <>
                        <p className="">Subscribed</p>
                        <CheckCircle />
                      </>
                    ) : (
                      <>
                        <p className="">Subscribe</p>
                        <Bell />
                      </>
                    )}
                  </button>
                )
              ) : (
                <>
                  <Modal
                    isOpen={isModalNewTaskOpen}
                    onClose={() => setIsModalNewTaskOpen(false)}
                    name="Please sign in to Subscribe"
                  >
                    <SignInModal
                      isOpen={isModalNewTaskOpen}
                      onClose={() => setIsModalNewTaskOpen(false)}
                    />
                  </Modal>
                  <button>
                    <p className="">Subscribe</p>
                    <Bell />
                  </button>
                </>
              )}
            </div>
          </div>
          <ul className="no-scrollbar sticky top-0 left-4 bg-gray-200 z-[2] flex flex-row gap-x-2 overflow-auto border-b-2 border-gray-400 py-2 sm:mr-12">
            <li className="w-full">
              <Link href={`channel/${username}/videos`}>
                <button className="w-full">Videos</button>
              </Link>
            </li>
            <li className="w-full">
              <Link href={`channel/${username}/playlist`}>
                <button className="w-full">Playlist</button>
              </Link>
            </li>
            <li className="w-full">
              <Link href={`channel/${username}/tweets`}>
                <button className="w-full">Tweets</button>
              </Link>
            </li>
            <li className="w-full">
              <Link href={`channel/${username}/subscribed`}>
                <button className="w-full">Subscribed</button>
              </Link>
            </li>
            <li className="w-full">
              <Link href={`channel/${username}/about`}>
                <button className="w-full">About</button>
              </Link>
            </li>
          </ul>
          {children}
        </div>
      </section>
    )
  );
};

export default Channel;
