import React from "react";

type InfoChannelProps = {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
};

const InfoChannel = ({ title, value, icon }: InfoChannelProps) => {
  return (
    <div className="border-1 border-gray-300 p-4">
      <div className="mb-2">
        <span className="inline-block rounded-full bg-[#f8c3fa] p-1 text-pink-400">{icon}</span>
      </div>
      <h6 className="text-gray-600">{title}</h6>
      <p className="text-xl font-semibold text-gray-600">{value}</p>
    </div>
  );
};

export default InfoChannel;
