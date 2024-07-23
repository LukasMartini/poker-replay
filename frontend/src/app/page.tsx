import HandCard from "@/components/HandCard";
import SearchBar from "@/components/Search";

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
        <SearchBar />
      </div>
    </div>
  );
}

export default Search
