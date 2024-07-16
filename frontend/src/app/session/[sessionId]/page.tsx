"use client";
import React, { useEffect } from "react";
// import MetaData from "./MetaData";
// import TableData from "./TableData";
// import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { usePathname } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SessionDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow

    var othiResult: Array<any> = [];
    var paResult: Array<any> = [];
    var pcResult: Array<any> = [];

    const pathname = usePathname();

    const apiCall = async (searchTerm: string) => {
        // Run SQL queries to fetch appropriate data. See server.py for further information.
        // await fetch(`${API_URL}hand_summary/${searchTerm}`)
        //         .then(resp => resp.json())
        //         .then(data => {
        //             othiResult = data;
        //         });

        // await fetch(`${API_URL}player_actions/${searchTerm}`)
        //         .then(resp => resp.json())
        //         .then(data => {
        //             paResult = data;
        //         });

        // await fetch(`${API_URL}player_cards/${searchTerm}`)
        //         .then(resp => resp.json())
        //         .then(data => {
        //             pcResult = data;
        //         });
        console.log(searchTerm);
    }

    
    useEffect(() => {
        apiCall(pathname.slice(1));
    }, [])

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
            <text>Session details for ${pathname}</text>
        </div>
    );
}