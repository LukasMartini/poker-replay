"use client"
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Chart from 'chart.js/auto';
import { CategoryScale } from "chart.js";
import { BarChart, generateChartData } from "./BarChart";
import HandCard from "@/components/HandCard";
import Image from "next/image";
import { Hand } from "@/util/utils";
import { useAuth } from '@/components/auth/AuthContext';
import { fetchCashFlowByUser, fetchHandCount, fetchHandSummary, fetchPlayerActions, fetchPlayerCards, fetchSessions, fetchPlayerSearch } from "@/util/api-requests";
import SessionTable from "./SessionTable";

import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

type DisplayMode = "chart" | "table";

const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [r1, setResponse1] = useState([]);
    const [r2, setResponse2] = useState([]);
    const [r3, setResponse3] = useState([]);
    const [sessionData, setSessionData] = useState([]);

    const [offset, setOffset] = useState(0);
    const [playerMatches, setPlayerMatches] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const user = useAuth();
    const [displayMode, setDisplayMode] = useState<DisplayMode>("chart");
    const [inputValue, setInputValue] = useState("");

    var combinedData = [];
    
    var response1 = new Response();
    var response2 = new Response();
    var response3 = new Response();
    var sessionResponse = new Response();

    var [handCount, setHandCount] = useState(0); // this *should* be useState, not required until pagination
    var [chartData, setChartData] = useState(generateChartData([]));
    var [links, setLinks] = useState([]);
    
    var response1 = new Response();

    useEffect(() => {
      if (user.auth.token != null) {
        fetchQuantity()
      }
    }, [user]);

    useEffect(() => {
      if (user.auth.token != null) {
        fetchCashData(offset, 30);
      }
    }, [user, offset]);

    useEffect(() => {
        if (displayMode === "table" && user.auth.token != null) {
            loadSessionTable();
        }
    }, [displayMode, user]);

    const handleSearch = async (searchTerm: string) => {
        const token = user.auth.token;
        if (searchTerm) {
          if (!isNaN(parseInt(searchTerm))) {
            response1 = await fetchHandSummary(searchTerm, token);
            setResponse1(await response1.clone().json());
          } else {
            const playerMatchesResponse = await fetchPlayerSearch(searchTerm, token);
            setPlayerMatches(await playerMatchesResponse.clone().json());
            setSelectedIndex(-1); // Reset selection index when search results change
          }
        } else {
          setPlayerMatches([]);
          setSelectedIndex(-1); // Reset selection index when search term is cleared
        }
    }

    const loadSessionTable = async () => {
        sessionResponse = await fetchSessions(50, 0, user.auth.token); 
        setSessionData(await sessionResponse.clone().json());
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
  
      setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`));
      setChartData(generateChartData(data));
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prevIndex) => {
                const newIndex = prevIndex + 1;
                return newIndex < playerMatches.length ? newIndex : playerMatches.length - 1;
            });
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prevIndex) => {
                const newIndex = prevIndex - 1;
                return newIndex >= -1 ? newIndex : -1;
            });
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            if (playerMatches.length === 1) {
                replace(`/player/${playerMatches[0][1]}`);
            }
            replace(`/player/${playerMatches[selectedIndex][1]}`);
        }
    }, [playerMatches, selectedIndex, replace]);

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

    const handleDisplayModeChange = (mode: DisplayMode) => {
      setDisplayMode(mode);
    };

    return (
        <div className="relative">
          <div className="relative w-1/2">
            <input 
                className="peer block w-1/2 bg-[#2C2C2C] rounded-md border border-[#879195] py-[9px] pl-4 text-sm placeholder:text-[#879195] focus:outline-none"
                placeholder="Search player / hand ID"
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => {
                    setInputValue(e.target.value)
                    handleSearch(e.target.value)
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleKeyDown}
            />
            {!inputValue && (
                <Image
                    src="/Search.svg"
                    alt="Magnify Glass"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#879195]"
                    width={20}
                    height={20}
                />
            )}
          </div>
            {isInputFocused && playerMatches.length > 0 && (
              <div className="absolute bg-[#2C2C2C] z-10 w-1/2 mt-2 shadow-xl rounded-md max-h-60 overflow-y-auto">
                {playerMatches.map((match, index) => (
                  <div 
                    key={index} 
                    className={`p-2 cursor-pointer hover:bg-gray-400 ${index === selectedIndex ? 'bg-gray-200' : ''}`}
                    onMouseDown={() => replace(`/player/${match[1]}`)}
                  >
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
            <div className="flex relative pt-8">
              <button 
                onClick={() => handleDisplayModeChange("chart")}
                className={`py-2 w-24 relative z-10 ${displayMode === "chart" ? "text-white" : "text-gray-400"} transition-colors duration-300`}
              >
                  Chart
              </button>
              <button 
                onClick={() => handleDisplayModeChange("table")}
                className={`py-2 w-24 relative z-10 ${displayMode === "table" ? "text-white" : "text-gray-400"} transition-colors duration-300`}
              >
                Table
              </button>
              <div 
                className={`absolute bottom-0 h-0.5 w-24 bg-white transition-transform duration-300 ${displayMode === "chart" 
                ? "transform translate-x-0" 
                : "transform translate-x-full"}`} 
              />
            </div>
            {displayMode === "chart" && (
              <div className="flex justify-between translate-y-10">
                <button onClick={handleClickLeft} disabled={isLeftButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-100 hover:scale-105">
                  <Image src={"/left-w.svg"} alt="left" width={24} height={24} />
                </button>

                <button onClick={handleClickRight} disabled={isRightButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-00 hover:scale-105">
                  <Image src={"/right-w.svg"} alt="right" width={24} height={24} />
                </button>
              </div>
            )}
            {displayMode === "chart" ? (
              <BarChart chartData={chartData} hyperlinks={links} title="Profit/Loss" subtitle="All past hands" />
            ) : (
              <div className="py-2">
                <h2 className="text-center text-2xl">Poker Sessions</h2>
                <SessionTable data={sessionData} />
              </div>
            )}
      </div>
        
    )
}

export default SearchBar
