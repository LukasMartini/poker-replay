"use client"
import { useSearchParams, usePathname, useRouter} from "next/navigation"
import { useState } from "react";
import HandCard from "@/components/HandCard";
import 'dotenv/config'

const API = process.env.API;

const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [r1, setResponse1] = useState([]);
    const [r2, setResponse2] = useState([]);
    const [r3, setResponse3] = useState([]);

    var combinedData = [];
    
    var response1 = new Response();
    var response2 = new Response();
    var response3 = new Response();

    const handleSearch = async (searchTerm: string) => {
        response1 = await fetch(`http://146.190.240.220/api/hand_summary/${searchTerm}`);
        response2 = await fetch(`http://146.190.240.220/api/player_actions/${searchTerm}`);
        response3 = await fetch(`http://146.190.240.220/api/player_cards/${searchTerm}`);

        setResponse1(await response1.json());
        setResponse2(await response2.json());
        setResponse3(await response3.json());

        combinedData = [r1, r2, r3];
        console.log(combinedData);

    //     const params = new URLSearchParams(searchParams);
    //     if (searchTerm) {
    //         params.set("query", searchTerm);
    //     } 
    //     else {
    //         params.delete("query");
    //     }
    //   replace(`${pathname}?${params.toString()}`)
    }
    return (
        <div className="relative">
                <input 
                    className="peer block w-1/2 bg-[#2C2C2C] rounded-md border border-[#879195] py-[9px] pl-4 text-sm outline-2 placeholder:text-[#879195]"
                    placeholder="Search hands"
                    defaultValue={searchParams.get('query')?.toString()}
                    onChange={(e) => {
                        handleSearch(e.target.value)
                    }}
                />
            <div className="grid grid-cols-4 gap-12 pt-12">
                {r1.map((info: any, index) => {
                    // console.log(info);
                   return  <HandCard handId={info.id} played_at={info.played_at} tableName={info.table_name} key={index} />
                })}
            </div>
        </div>
        
    )
}

export default SearchBar