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

  if (!userProfile) return null;
  return (
    <section className="relative w-full text-gray-600">
      <div className="relative h-[200px] sm:h-[350px] aspect-auto w-full">
        <Image
          src={userProfile.coverImage as string}
          alt={userProfile.username}
          fill
          priority
          className="object-cover mx-auto"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
          <div className="flex gap-4 mt-4">
            <div className="w-16 h-16 aspect-auto">
              <Image
                src={userProfile.avatar as string}
                alt={userProfile.description as string}
                width={64}
                height={64}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl text-gray-600">{userProfile.fullName}</h1>
              <p className="text-sm text-gray-600">@{userProfile.username}</p>
              <p className="text-sm text-gray-600">
                {userProfile.subscribersCount} subscribers .{" "}
                {userProfile.channelsSubscribedToCount} subscribed
              </p>
            </div>
          </div>
          <div className="mt-4">
            {user ? (
              user.username === userProfile.username ? (
                <button
                  onClick={() => router.push("/settings")}
                  className="flex items-center font-semibold py-1 px-2 transition-all duration-150 ease-in-out active:translate-x-1 active:translate-y-1 rounded-md hover:bg-pink-600"
                >
                  <Edit className="h-4 w-4" />
                  <p className="ml-2 font-semibold">Edit</p>
                </button>
              ) : (
                <button className="flex gap-2 items-center">
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
        <nav className="mt-6">
          <ul className="flex items-center gap-4 overflow-x-auto">
            <li>
              <Link
                href={`/channel/${username}/featured`}
                className="block px-4 py-2 hover:bg-gray-200 hover:rounded-md text-sm font-medium text-gray-600"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/channel/${username}/videos`}
                className="block px-4 py-2 hover:bg-gray-200  hover:rounded-md text-sm font-medium text-gray-600"
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                href={`/channel/${username}/playlists`}
                className="block px-4 py-2 hover:bg-gray-200 hover:rounded-md text-sm font-medium text-gray-600"
              >
                Playlists
              </Link>
            </li>
            <li>
              <Link
                href={`/channel/${username}/tweets`}
                className="block px-4 py-2 hover:bg-gray-200 hover:rounded-md text-sm font-medium text-gray-600"
              >
                Posts
              </Link>
            </li>
            <li>
              <Link
                href={`/channel/${username}/about`}
                className="block px-4 py-2 hover:bg-gray-200 hover:rounded-md text-sm font-medium text-gray-600"
              >
                Shorts
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">{children}</div>
    </section>
  );
};

export default Channel;
