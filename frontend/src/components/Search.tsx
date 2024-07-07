"use client"
import { useSearchParams, usePathname, useRouter} from "next/navigation"
import { useState, useEffect } from "react";
import Chart from 'chart.js/auto'
import { CategoryScale } from "chart.js";
import { BarChart, generateChartData } from "./BarChart";
import HandCard from "@/components/HandCard";
import 'dotenv/config'

const API = process.env.API;

Chart.register(CategoryScale);


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

    var [handCount, setHandCount] = useState(0); // this *should* be useState, not required until pagination
    var [chartData, setChartData] = useState(generateChartData([]));
    var [links, setLinks] = useState([]);

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

    useEffect(() => {
      const fetchQuantity = async () => {
        await fetch(`http://146.190.240.220/api/hand_count/1`)
          .then(resp => resp.clone().json())
          .then(data => {
              if (data === 'undefined') {
                return console.log("Hand count request returned undefined");
              }
  
              setHandCount(data[0].hands);
              console.log(`Found ${handCount} hands for userID 1, server returned ${data[0].hands}`);
              fetchCashData(0, Math.min(30, data[0].hands as number));
          });
      }
  
      const fetchCashData = async (offset: number, amount: number = 30) => {
        // fetch an amount of data from the given offset
        await fetch(`http://146.190.240.220/api/cash_flow/1+${amount}+${offset}`)
          .then(resp => resp.clone().json())
          .then(data => {
            if (data === 'undefined') {
              return console.log("Hand count request returned undefined");
            }

            setLinks(data.map((hand: any) => `http://localhost:3000/${hand.hand_id}`));
            setChartData(generateChartData(data));
          });
      }

      fetchQuantity()
    }, []);

    // console.log("Hyperlinks: " + links)
  
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
            <BarChart 
              chartData={chartData}
              hyperlinks={links}
            />
        </div>
        
    )
}

export default SearchBar