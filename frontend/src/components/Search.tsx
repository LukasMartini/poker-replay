"use client"
import { useSearchParams, usePathname, useRouter} from "next/navigation"
import { useState, useEffect } from "react";
import Chart from 'chart.js/auto'
import { CategoryScale } from "chart.js";
import { BarChart, generateChartData } from "./BarChart";
import HandCard from "@/components/HandCard";
import Image from "next/image";
import { Hand } from "@/lib/utils";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [r1, setResponse1] = useState([]);
    const [r2, setResponse2] = useState([]);
    const [r3, setResponse3] = useState([]);
    const [offset, setOffset] = useState(0);

    var combinedData = [];
    
    var response1 = new Response();
    var response2 = new Response();
    var response3 = new Response();

    var [handCount, setHandCount] = useState(0); // this *should* be useState, not required until pagination
    var [chartData, setChartData] = useState(generateChartData([]));
    var [links, setLinks] = useState([]);

    useEffect(() => {
      fetchQuantity()
    }, []);

    useEffect(() => {
      fetchCashData(offset, 30);
    }, [offset]);

    const handleSearch = async (searchTerm: string) => {
        response1 = await fetch(`${API_URL}hand_summary/${searchTerm}`);
        response2 = await fetch(`${API_URL}player_actions/${searchTerm}`);
        response3 = await fetch(`${API_URL}player_cards/${searchTerm}`);

        setResponse1(await response1.clone().json());
        setResponse2(await response2.clone().json());
        setResponse3(await response3.clone().json());

        combinedData = [r1, r2, r3];
        console.log(combinedData);
    }

    const fetchQuantity = async () => {
      const response = await fetch(`${API_URL}hand_count/1`);
      const data = await response.json();
  
      if (data === 'undefined') {
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
  
      const response = await fetch(`${API_URL}cash_flow/1?limit=${amount}&offset=${actualOffset}`);
      const data = await response.json();
  
      if (data === 'undefined') {
        console.log("Cash flow request returned undefined");
        return;
      }
  
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