"use client";
import { useState, useEffect } from "react";
import TableData from "./TableData";
import HandDetails from './HandDetails';
import MetaData from "./MetaData";
import Replay from './Replay';
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;




export default function GetDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    const pathname = usePathname();
    var pn: string = "";
    if (pathname.includes("+%7")) pn = pathname.slice(1, pathname.length-4);
    else pn = pathname.slice(1);

    const [othiResult, setResponse1]: [any, any] = useState([]);
    const [paResult, setResponse2]: [any, any] = useState([]);
    const [pcResult, setResponse3]: [any, any] = useState([]);

    let rows: Array<any> = [];

    const handleSearch = async (searchTerm: string) => {
        const othiResponse2 = await fetch(`${API_URL}hand_summary/${searchTerm}`);
        const paResponse2 = await fetch(`${API_URL}player_actions/${searchTerm}`);
        const pcResponse2 = await fetch(`${API_URL}player_cards/${searchTerm}`);

        setResponse1(await othiResponse2.json());
        setResponse2(await paResponse2.json());
        setResponse3(await pcResponse2.json());

        // console.log(rows);
    }

    useEffect(() => {
        handleSearch(pn);
    }, [])

    // Note that there should never be a '-1' action number by virtue of the way they are assigned.
    // See the for loop below.
    let displayedAction: number = -1; 

    const rowOnClick = (e: any) => { // Sets displayedAction's index to the name field of the HandDetails object clicked.
        displayedAction = e;
    }

    if (othiResult[0] && paResult && pcResult && pcResult[0]) {
        for (var action = 0; action < paResult.length; action++) {
            rows.push(  <div className="py-2">
                            <HandDetails name={action} row={[paResult[action].name, paResult[action].betting_round, 
                            paResult[action].action_type, paResult[action].amount, 
                            othiResult[0].flop_card1, othiResult[0].flop_card2, othiResult[0].flop_card3,
                            othiResult[0].turn_card, othiResult[0].river_card]} onClick={rowOnClick}/>
                        </div>)
        }
        
    }

    // rows.push(<TableData betting_round={paResult[i].betting_round} betting_amount={paResult[i].amount} 
        //     player_name={paResult[i].name} card_1={pcResult[pc_index].hole_card1} card_2={pcResult[pc_index].hole_card2}/>);

    // console.log(othiResult)
    // console.log(paResult);
    // console.log(pcResult);

    // TODO: fix spacing for handdetails
    // TODO: implement onClick
    // TODO: Setup Replay

    return (
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for all child components.*/}
            <div dir="ltr" className="flex flex-row justify-between py-8">
                <div className="flex flex-col"> {/* Contains MetaData, Replay display, and pagination interface. */}
                    <MetaData handID={pn} tableName={othiResult[0] && othiResult[0].table_name} 
                        timestamp={othiResult[0] && othiResult[0].played_at}/>
                    <Replay/>
                </div>
                <div className="flex flex-col"> {/* Contains HandDetails side bar. */}
                    <h1>HANDDETAILS</h1>
                    {rows}
                </div>
            </div>
        </div>
    );
}
