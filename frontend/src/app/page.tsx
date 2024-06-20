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

// TODO
// add search bar + functionality
// display hand data from backend

const Search = () => {

  return (
    <div className="bg-[#2C2C2C] text-white px-24">
      <div className="py-12 justify-center">
        <SearchBar />
      </div>
      {/* <div className="grid grid-cols-4 gap-12">
        {test.map((info, index) => (
          <HandCard handId={info.handId} userId={info.userId} tableName={info.tableName} key={index} />
        ))}
      </div> */}
    </div>
  );
}

export default Search
