import React from "react";

interface MainProps {
  children: React.ReactNode;
}

const Main = ({ children }: MainProps) => {
  return <main className="p-4 flex-1">{children}</main>;
};

export default Main;
