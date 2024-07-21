'use client';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import StaticData from "./StaticData";
import Uploads from "./Uploads";
import Sessions from "./Sessions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO: find out if we are including a chart here and if so, what of.

export default function ProfileView() {
    const pathname = usePathname().slice(9);
    const [result, setResp]: [any, any] = useState([])

    const handleQuery = async (searchTerm: string) => {
        console.log(`${API_URL}profile/${pathname}`);
        const response = await fetch(`${API_URL}profile/${pathname}`);
        setResp(await response.json());
        // TODO: if null, redirect to login page.
    }

    useEffect(() => {
        handleQuery(pathname);
        // console.log(resp);
    }, [])

    return (
        <div>
            <h1>HELLO</h1>
            <StaticData username={result[0] && result[0][0]} email={result[0] && result[0][1]} created_at={result[0] && result[0][2]}/>
            <Uploads list_of_uploads={result && result[1]}/>
            <Sessions list_of_sessions={result && result[2]}/>
        </div>
    );
}
