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
import { fetchCashFlow } from "@/util/api-requests";

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

    const apiCall = async (userId: string) => {
        // Run SQL queries to fetch appropriate data. See server.py for further information.
        await fetchCashFlow(session, 50, 0, user.auth.token)
            .then(resp => resp.json())
            .then(data => {
                setChartData(generateSessionLineData(data))
                setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`))
            });
    }

    
    useEffect(() => {
        apiCall("1"); // TODO: use cached user
    }, [user])

    // var rows: Array<any> = [];
    // var pc_index: number = 0;
    // for (var i = 0; i < paResult.length; i++) { // Create a variable number of rows equal to the number of actions.
    //     for (var card_index = 0; card_index < pcResult.length; card_index++) { // Find tuples from player_cards related to a given player id
    //         if (paResult[i].player_id === pcResult[card_index].player_id) {
    //             pc_index = card_index;
    //             break;
    //         }
    //     }
    //     rows.push(<TableData betting_round={paResult[i].betting_round} betting_amount={paResult[i].amount} 
    //         player_name={paResult[i].name} card_1={pcResult[pc_index].hole_card1} card_2={pcResult[pc_index].hole_card2}/>);
    // }
    return (
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for both child components.*/}
            <LineChart chartData={chartData} hyperlinks={links} />
        </div>
    );
}