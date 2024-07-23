'use client';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import StaticData from "./StaticData";
import Uploads from "./Uploads";
import Sessions from "./Sessions";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchProfile } from "@/util/api-requests";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL;

// TODO: find out if we are including a chart here and if so, what of.

export default function ProfileView() {
    const user = useAuth();

    const pathname = usePathname().slice(9);
    const [result, setResp]: [any, any] = useState([])

    const handleQuery = async (searchTerm: string) => {
        const response = await fetchProfile(pathname, user.auth.token);
        setResp(await response.json());
    }

    useEffect(() => {
        if (pathname === "null") { // If the user is not logged in, redirect to the login page.
            window.location.href = `${ROOT_URL}login`;
        }
        handleQuery(pathname);
    }, [])

    return (
        <div className="bg-[#2C2C2C] text-white px-16">
            <StaticData username={result && result[0] && result[0][0][0]} email={result && result[0] && result[0][0][1]} created_at={result && result[0] && result[0][0][2]}/>
            <Uploads list_of_uploads={result && result[1]} number_of_uploads={result && result[1] && result[1].length}/>
            <Sessions list_of_sessions={result && result[2]} number_of_sessions={result && result[2] && result[2].length}/>
        </div>
    );
}
