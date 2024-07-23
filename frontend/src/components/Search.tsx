"use client"
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Chart from 'chart.js/auto';
import { CategoryScale } from "chart.js";
import { BarChart, generateChartData } from "./BarChart";
import HandCard from "@/components/HandCard";
import Image from "next/image";
import { Hand } from "@/util/utils";
import { useAuth } from '@/components/auth/AuthContext';
import { fetchCashFlowByUser, fetchHandCount, fetchHandSummary, fetchPlayerActions, fetchPlayerCards, fetchPlayerSearch } from "@/util/api-requests";

Chart.register(CategoryScale);

const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [r1, setResponse1] = useState([]);
    const [r2, setResponse2] = useState([]);
    const [r3, setResponse3] = useState([]);
    const [offset, setOffset] = useState(0);
    const [playerMatches, setPlayerMatches] = useState([]);
    const user = useAuth();

    var combinedData = [];
    
    var response1 = new Response();
    var response2 = new Response();
    var response3 = new Response();

    var [handCount, setHandCount] = useState(0); // this *should* be useState, not required until pagination
    var [chartData, setChartData] = useState(generateChartData([]));
    var [links, setLinks] = useState([]);

    useEffect(() => {
      if (user.auth.token != null) {
        console.log('Checking for cash data with user', user)
        fetchQuantity()
      }
    }, [user]);

    useEffect(() => {
      if (user.auth.token != null) {
        console.log('Checking for cash data with user', user)
        fetchCashData(offset, 30);
      }
    }, [user]);

    const handleSearch = async (searchTerm: string) => {
        const token = user.auth.token;
        if (searchTerm) {
          if (!isNaN(parseInt(searchTerm))) {
            response1 = await fetchHandSummary(searchTerm, token);
            response2 = await fetchPlayerActions(searchTerm, token);
            response3 = await fetchPlayerCards(searchTerm, token);

            setResponse1(await response1.clone().json());
            setResponse2(await response2.clone().json());
            setResponse3(await response3.clone().json());

          } else {
            console.log("Searching for: ", searchTerm);
            const playerMatchesResponse = await fetchPlayerSearch(searchTerm, token);
            setPlayerMatches(await playerMatchesResponse.clone().json());
            console.log(playerMatches);
          }
        } else {
          setPlayerMatches([]);
        }
    }

    const fetchQuantity = async () => {
      const response = await fetchHandCount(user.auth.token);
      const data = await response.json();
      
      if (data === 'undefined' || data.size == 0) {
        console.log("Hand count request returned undefined");
        return;
      }
  
      setHandCount(data[0].hands);
      console.log(`Found ${data[0].hands} hands for userID 1, server returned ${data[0].hands}`);
    };
  
    const fetchCashData = async (offset: number, amount = 30) => {
      let actualOffset = offset;
      if (offset + amount > handCount) {
        actualOffset = handCount - amount;
        actualOffset = actualOffset < 0 ? 0 : actualOffset;
      }
  
      const response = await fetchCashFlowByUser(amount, actualOffset, user.auth.token);
      const data = await response.json();
  
      if (data === 'undefined') {
        console.log("Cash flow request returned undefined");    
        return;
      }

      console.log(data);
  
      setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`));
      setChartData(generateChartData(data));
    };

    const handleClickLeft = () => {
      setOffset((prevOffset) => Math.max(prevOffset - 30, 0));
    }
    const handleClickRight = () => {
      setOffset((prevOffset) => {
        const newOffset = prevOffset + 30;
        return newOffset < handCount ? newOffset : prevOffset;
      });
    }

    const isLeftButtonDisabled = offset === 0 || handCount <= 30;
    const isRightButtonDisabled = offset + 30 >= handCount || handCount <= 30;

    return (
        <div className="relative">
            <input 
                className="peer block w-1/2 bg-[#2C2C2C] rounded-md border border-[#879195] py-[9px] pl-4 text-sm outline-2 placeholder:text-[#879195]"
                placeholder="Search player / hand ID"
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => {
                    handleSearch(e.target.value)
                }}
            />
            {playerMatches.length > 0 && (
              <div className="absolute bg-gray-600 z-10 w-1/2 mt-2 shadow-lg rounded-md max-h-60 overflow-y-auto">
                {playerMatches.map((match, index) => (
                  <div key={index} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSearch(match[1])}>
                    {match[1]}
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-4 gap-12 pt-12">
                {r1.map((info: any, index) => {
                  return  <HandCard handId={info.id} played_at={info.played_at} tableName={info.table_name} key={index} />
                })}
            </div>
            <div className="flex justify-between translate-y-10">
              <button onClick={handleClickLeft} disabled={isLeftButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-100 hover:scale-105">
                <Image src={"/left-w.svg"} alt="left" width={24} height={24} />
              </button>

              <button onClick={handleClickRight} disabled={isRightButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-00 hover:scale-105">
                <Image src={"/right-w.svg"} alt="right" width={24} height={24} />
              </button>
            </div>
            <BarChart chartData={chartData} hyperlinks={links} title="Profit/Loss" subtitle="All past hands" />
        </div>

    )
}

export default SearchBar