"use client"
import { useSearchParams, usePathname, useRouter} from "next/navigation"
import { useState } from "react";
import Chart from 'chart.js/auto'
import { CategoryScale } from "chart.js";
import { BarChart } from "./timeline";
import HandCard from "@/components/HandCard";
import 'dotenv/config'

const API = process.env.API;

Chart.register(CategoryScale);

// temporary, to be returned from API call
export const Data = [
  {
    id: 1,
    played_at: new Date(2023, 9, 27, 22, 56, 41),
    amount: -0.02
  },
  {
    id: 2,
    played_at: new Date(2023, 9, 27, 22, 57, 21),
    amount: -0.01
  },
  {
    id: 3,
    played_at: new Date(2023, 9, 27, 22, 58, 9),
    amount: -0.04
  },
  {
    id: 4,
    played_at: new Date(2023, 9, 27, 22, 58, 38),
    amount: 0
  },
  {
    id: 5,
    played_at: new Date(2023, 9, 27, 22, 59, 28),
    amount: -0.02
  },
  {
    id: 6,
    played_at: new Date(2023, 9, 27, 23, 0, 26),
    amount: -0.01
  },
  {
    id: 7,
    played_at: new Date(2023, 9, 27, 23, 0, 49),
    amount: 0.40
  },
  {
    id: 8,
    played_at: new Date(2023, 9, 27, 23, 2, 22),
    amount: -0.02
  },
  {
    id: 9,
    played_at: new Date(2023, 9, 27, 23, 3, 22),
    amount: 0
  },

  {
    id: 10,
    played_at: new Date(2023,9,27,23,4,6),
    amount:	0
  },
  {
    id: 11,
    played_at: new Date(2023,9,27,23,4,33),
    amount: 0.00
  },
  {
    id: 12,
    played_at: new Date(2023,9,27,23,5,4),
    amount: 0.00
  },
  {
    id: 13,
    played_at: new Date(2023,9,27,23,5,51),
    amount: -0.08
  },
  {
    id: 14,
    played_at: new Date(2023,9,27,23,6,35),
    amount: -0.01
  },
  {
    id: 15,
    played_at: new Date(2023,9,27,23,6,57),
    amount: -0.06
  },
  {
    id: 16,
    played_at: new Date(2023,9,27,23,7,30),
    amount: 0.33
  },
  {
    id: 17,
    played_at: new Date(2023,9,27,23,8,3),
    amount: 0
  },
  {
    id: 18,
    played_at: new Date(2023,9,27,23,8,27),
    amount: 0.00
  },
  {
    id: 19,
    played_at: new Date(2023,9,27,23,8,39),
    amount: -0.04
  },
  {
    id: 20,
    played_at: new Date(2023,9,27,23,9,44),
    amount: -0.01
  },
];

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

    // find max and min for interpolation
    var maxAmount = 0
    var minAmount = 0
    // load them immediately
    for (let hand of Data) {
      if (hand.amount < minAmount) {
        minAmount = hand.amount
      }
      if (hand.amount > maxAmount) {
        maxAmount = hand.amount
      }
    }
    // now run through and calculate colours and hyperlinks for every bar
    var colours: string[] = []
    var links: string[] = []
    for (let hand in Data) {
      // colour
      let amount = Data[hand].amount
      if (amount < 0) {
        let col = 255 - amount/minAmount * 128
        colours[hand] = `rgba(255, ${col}, ${col}, 1)`
      }
      
      if (amount > 0) {
        let col = 255 - amount/maxAmount * 128
        colours[hand] = `rgba(${col}, 255, ${col}, 1)`
      }

      // hyperlink
      links[hand] = `http://localhost:3000/${Data[hand].id}`
    }

    const [chartData, setChartData] = useState({
      labels: Data.map((data) => data.played_at.toDateString()), 
      datasets: [
        {
          label: "Users Gained ",
          data: Data.map((data) => data.amount),
          // pre-generated list of colours based off the data
          backgroundColor: colours,
          borderColor: "black",
          borderWidth: 3
        }
      ]
    });

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
            <BarChart chartData={chartData} hyperlinks={links} />
        </div>
        
    )
}

export default SearchBar