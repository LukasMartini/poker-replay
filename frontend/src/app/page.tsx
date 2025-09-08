import { Suspense } from "react";
import HandCard from "@/components/HandCard";
import SearchBar from "@/components/Search";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const test = [
  {
      handId: "aaaaaaaaa",
      userId: "text 2",
      tableName: "text 3",
  },
  {
    handId: "ssssssss",
    userId: "text 2",
    tableName: "text 3",
  },
  {
    handId: "ddddddddddd",
    userId: "text 2",
    tableName: "text 3",
  },
  {
    handId: "ffffffff",
    userId: "text 2",
    tableName: "text 3",
  },
];

const Search = () => {
  return (
    <div className="bg-[#2C2C2C] text-white px-24">
      <div className="py-12 justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchBar />
        </Suspense>
      </div>
    </div>
  );
}

export default Search
