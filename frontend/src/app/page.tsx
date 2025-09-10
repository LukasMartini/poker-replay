"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Search = dynamic(() => import("@/components/Search"), { ssr: false });

const App = () => {
  return (
    <div className="brm -g-[#2C2C2C] text-white px-24">
      <div className="py-12 justify-center">
        <Suspense fallback={<div>Loading search...</div>}>
          <Search />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
