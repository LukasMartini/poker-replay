"use client";
import { useState, useEffect } from "react";
import MetaData from "./MetaData";
import TableData from "./TableData";
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { usePathname } from "next/navigation";
import { useAuth } from '@/components/auth/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;




export default function HandDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    const pathname = usePathname();
    const user = useAuth();

    const [othiResult, setResponse1]: [any, any] = useState([]);
    const [paResult, setResponse2] : [any, any] = useState([]);
    const [pcResult, setResponse3] : [any, any] = useState([]);

    let rows: Array<any> = [];

    const handleSearch = async (searchTerm: string) => {
        const othiResponse2 = await fetch(`${API_URL}hand_summary/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });
        const paResponse2 = await fetch(`${API_URL}player_actions/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });
        const pcResponse2 = await fetch(`${API_URL}player_cards/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });

        setResponse1(await othiResponse2.json());
        setResponse2(await paResponse2.json());
        setResponse3(await pcResponse2.json());



        console.log(rows);
    }

    useEffect(() => {
        if (user.auth.token != null)
            handleSearch(pathname.slice(1));
    }, [user])

    var pc_index: number = 0;
    if (paResult && pcResult && pcResult[0]) {
        for (var i = 0; i < paResult.length; i++) { // Create a variable number of rows equal to the number of actions.
            for (var card_index = 0; card_index < pcResult.length; card_index++) { // Find tuples from player_cards related to a given player id
            
                if (paResult[i].player_id === pcResult[card_index].player_id) {
                    pc_index = card_index;
                    break;
                }
            }

            rows.push(<TableData betting_round={paResult[i].betting_round} betting_amount={paResult[i].amount} 
                player_name={paResult[i].name} card_1={pcResult[pc_index].hole_card1} card_2={pcResult[pc_index].hole_card2}/>);
        }
    }

    console.log(othiResult)
    console.log(paResult);
    console.log(pcResult);


    return (
       
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for both child components.*/}
            <MetaData handID={pathname.slice(1)} tableName={othiResult[0] && othiResult[0].table_name} timestamp={othiResult[0] && othiResult[0].played_at}/>

            <Table> 
                <TableHeader className="text-[#31D2DD]">
                    <TableRow>
                    <TableHead>Betting Round</TableHead> {/* player_actions.betting_round */}
                    <TableHead>Betting Amount</TableHead> {/* player_actions.amount */}
                    <TableHead>Player</TableHead> {/* player.name (from player_actions) */}
                    <TableHead className="w-[100px]">Card 1</TableHead>  {/* player_cards */}
                    <TableHead className="w-[100px]">Card 2</TableHead> 
                    </TableRow>
                </TableHeader>
                {rows}

            </Table>

            
        </div>
    );
}
