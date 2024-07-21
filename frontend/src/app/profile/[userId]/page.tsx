'use client';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfileView() {
    const pathname = usePathname().slice(9);
    const [resp, setResp]: [any, any] = useState([])

    const handleQuery = async (searchTerm: string) => {
        console.log(`${API_URL}profile/${pathname}`);
        setResp(await fetch(`${API_URL}profile/${pathname}`));
        // TODO: if null, redirect to login page.
    }

    useEffect(() => {
        handleQuery(pathname);
        console.log(resp);
    }, [])

    return (
        <div>
            
        </div>
    );
}
