"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { debounce } from "lodash";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    500,
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  return (
    <div className="p-8">
      <Header name="Search" />
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 rounded border p-3 shadow"
          onChange={handleSearch}
        />
      </div>
      <div className="p-5">
    
      </div>
    </div>
  );
};

export default Search;
