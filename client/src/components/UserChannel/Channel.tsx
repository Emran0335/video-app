import React from "react";
import { icons } from "@/assets/Icons";
import { useGetUserChannelProfileQuery } from "@/state/api";
import Image from "next/image";

type ChannelProps = {
  username: string;
};

const Channel = ({ username }: ChannelProps) => {
  const { data: userData } = useGetUserChannelProfileQuery({
    username: username,
  });

  return userData ? (
    <section className="relative w-full pb-[70px] sm:ml-[ml-70]">
      <div className="">
        <div className="">
          <Image
            src={userData.avatar as string}
            alt={userData.username}
            width={100}
            height={100}
            className="object-cover"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>
    </section>
  ) : (
    <span className="flex justify-center mt-20">{icons.bigLoading}</span>
  );
};

export default Channel;
