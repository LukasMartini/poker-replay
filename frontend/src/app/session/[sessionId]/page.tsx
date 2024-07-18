"use client";
import React, { useEffect, useState } from "react";
// import MetaData from "./MetaData";
// import TableData from "./TableData";
// import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { usePathname } from "next/navigation";
import { LineChart, generateSessionLineData } from "@/components/SessionLineChart";
import { CategoryScale } from "chart.js/auto";
import { Chart } from "chart.js";
import { Hand } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

export default function SessionDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    var [chartData, setChartData] = useState(generateSessionLineData([]));
    var [links, setLinks] = useState([]);
    const [offset, setOffset] = useState(0);
    var [handCount, setHandCount] = useState(0);

    // var sessionResp: Array<any> = [];
    var paResult: Array<any> = [];
    var pcResult: Array<any> = [];

    const pathname = usePathname();
    const session = pathname.slice(9);

    const fetchQuantity = async () => {
        await fetch(`${API_URL}hand_count/1`)
            .then(resp => resp.json())
            .then(data => {
                setHandCount(data[0].hands);
            })
    };

    useEffect(() => {
        fetchQuantity();
    }, [])
  
    const fetchHandData = async () => { 
        // Run SQL queries to fetch appropriate data. See server.py for further information.
         // TODO: use cached user
        await fetch(`${API_URL}cash_flow/1?sessionid=${session}&limit=50&offset=${offset}`, {
            method: "GET"
        })
            .then(resp => resp.json())
            .then(data => {
                setChartData(generateSessionLineData(data))
                setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`))
            });
    }

    useEffect(() => {
        fetchHandData();
    }, [offset])

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
            <div className="flex justify-between translate-y-10">
                <button onClick={handleClickLeft} disabled={isLeftButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-100 hover:scale-105">
                    <Image src={"/left-w.svg"} alt="left" width={24} height={24} />
                </button>

                <button onClick={handleClickRight} disabled={isRightButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-00 hover:scale-105">
                    <Image src={"/right-w.svg"} alt="right" width={24} height={24} />
                </button>
            </div>
            <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for both child components.*/}
                <LineChart chartData={chartData} hyperlinks={links} />
            </div>
        </div>
    );
}