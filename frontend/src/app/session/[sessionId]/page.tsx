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
import { useAuth } from "@/components/auth/AuthContext";
import { fetchCashFlow, fetchHandCountInSession } from "@/util/api-requests";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

export default function SessionDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    var [chartData, setChartData] = useState(generateSessionLineData([]));
    var [links, setLinks] = useState([]);
    const user = useAuth();

    // var sessionResp: Array<any> = [];
    var paResult: Array<any> = [];
    var pcResult: Array<any> = [];

    const pathname = usePathname();
    const session = pathname.slice(9);

    const fetchQuantity = async () => {
        await fetchHandCountInSession(Number(session), user.auth.token)
            .then(resp => resp.json())
            .then(data => {
                setHandCount(data[0].hands);
            });
    };

    useEffect(() => {
        if (user.auth.token != null) {
            fetchQuantity();
        }
    }, [user])
  
    const fetchHandData = async () => { 
        // if we aren't rendering the start, and nothing has moved, don't do anything
        if (offset == oldOffset) return;
        console.log(`Fetching hand data from offset ${offset}`);
        console.log(`Current trend stack is `, trendStack);

        // Run SQL queries to fetch appropriate data. See server.py for further information.
         // TODO: use cached user
        await fetchCashFlow(session, 50, 0, user.auth.token)
            .then(resp => resp.json())
            .then(data => {
                setChartData(generateSessionLineData(data))
                setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`))
            });
    }

    
    useEffect(() => {
        if (user.auth.token) {
            fetchHandData();
        }
    }, [user, offset])

    const handleClickLeft = () => {
        setOffset((prevOffset) => Math.max(prevOffset - windowSize, 0));
    }
    const handleClickRight = () => {
        setOffset((prevOffset) => {
            const newOffset = prevOffset + windowSize;
            console.log(`Updating offset from ${prevOffset} to ${newOffset}`);
            return newOffset < handCount ? newOffset : prevOffset;
        });
    }  

    const isLeftButtonDisabled = offset === 0 || handCount <= windowSize;
    const isRightButtonDisabled = offset + windowSize >= handCount || handCount <= windowSize;

    return (
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for both child components.*/}
            <LineChart chartData={chartData} hyperlinks={links} />
        </div>
    );
}