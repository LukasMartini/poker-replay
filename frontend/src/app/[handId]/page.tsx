"use client";
import { useState, useEffect } from "react";
import HandDetails from './HandDetails';
import MetaData from "./MetaData";
import Replay from './Replay';
import { usePathname } from "next/navigation";
import { useAuth } from '@/components/auth/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Test with 2521 for all betting rounds.

export default function GetDetails() {
    const pathname = usePathname();
    const user = useAuth();
    
    var pn: string = "";
    if (pathname.includes("+%7")) pn = pathname.slice(1, pathname.length-4); // Hotfix for an issue where '}' is appended to the pathname.
    else pn = pathname.slice(1);

    const [othiResult, setResponse1]: [any, any] = useState([]);
    const [paResult, setResponse2]: [any, any] = useState([]);
    const [pcResult, setResponse3]: [any, any] = useState([]);

    let rows: Array<any> = [];

    const handleSearch = async (searchTerm: string) => {
        const othiResponse2 = await fetch(`${API_URL}hand_summary/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });
        const paResponse2 = await fetch(`${API_URL}player_actions/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });
        const pcResponse2 = await fetch(`${API_URL}player_cards/${searchTerm}`, { headers: {'Authorization': `Bearer ${user.auth.token}`} });

        setResponse1(await othiResponse2.json());
        setResponse2(await paResponse2.json());
        setResponse3(await pcResponse2.json());
    }

    useEffect(() => {
        if (user.auth.token != null)
            handleSearch(pn);
    }, [user])

    // Note that there should never be a '-1' action number by virtue of the way they are assigned.
    // See the for loop below.
    const [displayedAction, setDA] = useState(-1); // Necessary for making the useEffect update.
    let replayDisplay: any = <Replay othiResult={othiResult} paResult={paResult} pcResult={pcResult} action={displayedAction}/>;

    // This useEffect hook re-renders with the updated Replay component whenever displayedAction is set.
    useEffect(() => { 
        replayDisplay = <Replay othiResult={othiResult} paResult={paResult} pcResult={pcResult} action={displayedAction}/>;
        console.log(othiResult);
    }, [displayedAction])


    const rowOnClick = (e: any) => { // Sets displayedAction's index to the name field of the HandDetails object clicked.
        setDA(e); // Updates displayedAction so that the above useEffect hook re-renders.
    }

    // Assigns the necessary details to each HandDetails summary and pushes them to rows for display in the JSX.
    if (othiResult[0] && paResult && pcResult && pcResult[0]) { // Forces the code to wait for all the dependencies to exist.
        for (var action = 0; action < paResult.length; action++) {
            rows.push(<div className="py-2">
                        <HandDetails name={action} row={[paResult[action].name, paResult[action].betting_round, 
                        paResult[action].action_type, paResult[action].amount, 
                        othiResult[0].flop_card1, othiResult[0].flop_card2, othiResult[0].flop_card3,
                        othiResult[0].turn_card, othiResult[0].river_card]} onClick={rowOnClick}/></div>)
        }
    }

    const handlePrevClick = () => {
        if (displayedAction > 0) {
            setDA(displayedAction - 1);
        }
    }

    const handleNextClick = () => {
        if (displayedAction < paResult.length-1) {
            setDA(displayedAction + 1);
        }
    }
    
    // The styling below allows the summaries to be scrolled separately.
    return (
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for all child components.*/}
            <div dir="ltr" className="flex flex-row justify-between py-8">
                <div style={{width:"20cm", height:"75vh", overflow:"scroll"}} className="flex flex-col"> {/* Contains MetaData, Replay display, and pagination interface. */}
                    <MetaData handID={pn} tableName={othiResult[0] && othiResult[0].table_name} 
                        timestamp={othiResult[0] && othiResult[0].played_at}/>
                    {replayDisplay}
                    <div style={{margin:"auto"}}>
                        <button onClick={() => handlePrevClick()} className="px-10 bg-[#2CBDC7] text-[#2C2C2C] hover:bg-[#31D2DD]">
                            Previous</button>
                        <button onClick={() => handleNextClick()} className="px-10 bg-[#2CBDC7] text-[#2C2C2C] hover:bg-[#31D2DD]">
                            Next</button>
                    </div>
                </div>
                <div style={{width:"8cm", height:"80vh", overflow:"scroll"}} className="flex flex-col"> {/* Contains HandDetails side bar. */}
                    {rows}
                </div>
            </div>
        </div>
    );
}
