"use client";
import { useState, useEffect } from "react";
import HandDetails from './HandDetails';
import MetaData from "./MetaData";
import Replay from './Replay';
import TableData from "./TableData";
import PokerTable from "./PokerTable";
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { fetchHandSummary, fetchPlayerActions, fetchPlayerCards } from "@/util/api-requests";
import { useAuth } from '@/components/auth/AuthContext';
import './PokerTable.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GetDetails() {
    const pathname = usePathname();
    const user = useAuth();

    var pn: string = "";
    if (pathname.includes("+%7")) pn = pathname.slice(1, pathname.length - 4); // Hotfix for an issue where '}' is appended to the pathname.
    else pn = pathname.slice(1);

    const [othiResult, setResponse1]: [any, any] = useState([]);
    const [paResult, setResponse2]: [any, any] = useState([]);
    const [pcResult, setResponse3]: [any, any] = useState([]);
    const [endIndex, setEndIndex] = useState(0);

    let rows: Array<any> = [];

    const handleSearch = async (searchTerm: string) => {

        const token = user.auth.token;
        const othiResponse2 = await fetchHandSummary(searchTerm, token);
        const paResponse2 = await fetchPlayerActions(searchTerm, token);
        const pcResponse2 = await fetchPlayerCards(searchTerm, token);

        setResponse1(await othiResponse2.json());
        setResponse2(await paResponse2.json());
        setResponse3(await pcResponse2.json());
    }

    useEffect(() => {
        document.title = `Hand #${pathname.slice(1)} - PokerReplay`;

    }, [])

    useEffect(() => {
        if (user.auth.token != null)
            handleSearch(pn);
    }, [user])

    // Note that there should never be a '-1' action number by virtue of the way they are assigned.
    // See the for loop below.
    const [displayedAction, setDA] = useState(-1); // Necessary for making the useEffect update.
    let replayDisplay: any = <Replay othiResult={othiResult} paResult={paResult} pcResult={pcResult} action={displayedAction} />;

    // This useEffect hook re-renders with the updated Replay component whenever displayedAction is set.
    useEffect(() => {
        replayDisplay = <Replay othiResult={othiResult} paResult={paResult} pcResult={pcResult} action={displayedAction} />;
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
                othiResult[0].turn_card, othiResult[0].river_card]} onClick={rowOnClick} /></div>)
        }
    }

    const handlePrevClick = () => {
        if (displayedAction > 0) {
            setDA(displayedAction - 1);
        }
    }

    const handleNextClick = () => {
        if (displayedAction < paResult.length - 1) {
            setDA(displayedAction + 1);
        }
    }

    // The styling below allows the summaries to be scrolled separately.
    return (
        <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for all child components.*/}
            <div dir="ltr" className="flex flex-row justify-between py-8">
                <div style={{ width: "70vw", height: "80vh", overflowY: "scroll" }} className="flex flex-col"> {/* Contains MetaData, Replay display, and pagination interface. */}
                    <MetaData handID={pn} tableName={othiResult[0] && othiResult[0].table_name}
                        timestamp={othiResult[0] && othiResult[0].played_at} />

                    {
                        pcResult.length > 0 && paResult.length > 0 && ( // othiResult.length > 0 
                            <div className="svg-container" style={{ width: '100%', height: '500px' }}>
                                <PokerTable hand={othiResult} actions={paResult.slice(0, endIndex + 1)} players={pcResult} />
                            </div>
                        )
                    }

                    <div style={{ margin: "auto" }}>
                        <Button disabled={endIndex == 0} onClick={() => { setEndIndex(endIndex - 1) }} variant="secondary">Previous</Button>
                        <span style={{ marginLeft: "15px", marginRight: "15px" }}>{endIndex + 1} of {paResult.length} actions</span>
                        <Button disabled={endIndex == Math.max(0, paResult.length - 1)} onClick={() => { setEndIndex(endIndex + 1) }} variant="secondary">Next</Button>
                    </div>
                </div>
                <div style={{ width: "25vw", height: "80vh", overflowY: "scroll" }} className="flex flex-col"> {/* Contains HandDetails side bar. */}
                    {rows}
                </div>
            </div>
        </div>
    );
}
