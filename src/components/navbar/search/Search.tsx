import Button from "@/components/button/Button";
import Input from "@/components/Input";
import React from "react";
import { GoSearch } from "react-icons/go";

const Search = () => {
  return (
    <form className="flex">
      <div className="relative">
        <Input placeholder="Search" className="rounded-l-3xl" />
        <GoSearch className="absolute left-2 top-1/2"/>
      </div>
      <Button type="submit" bgColor="bg-zinc-800" className="rounded-r-3xl border border-gray-200 pr-4 pl-2 outline-none transition-colors hover:bg-gray-500 active:bg-green-400 cursor-pointer">
        Search
      </Button>
    </form>
  );
};

export default Search;
