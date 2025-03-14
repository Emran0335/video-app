import Button from "@/components/button/Button";
import Input from "@/components/Input";
import React from "react";
import { GoSearch } from "react-icons/go";

const Search = () => {
  return (
    <form className="flex items-center w-full max-w-lg">
      <div className="relative flex-grow">
        <Input placeholder="Search" className="rounded-l-3xl" />
        <GoSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-200" />
      </div>
      <Button
        type="submit"
        bgColor="bg-zinc-800"
        className="rounded-r-3xl hover:bg-gray-500 transition-colors outline-none border-gray-200 border"
      >
        Search
      </Button>
    </form>
  );
};

export default Search;
