import Link from "next/link";
import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth/AuthContext';
import { getSharedPlayers, shareHand, unshareHand } from "@/util/api-requests";

interface MetaDataProps {
    handID: string;
    tableName: string;
    timestamp: string;
}

export default function MetaData(props: MetaDataProps) {
    const [sharedPlayers, setSharedPlayers] = useState([]);
    const [shareInput, setShareInput] = useState("");
    const user = useAuth();

    const fetchSharedPlayers = useCallback(async () => {
        if (!user.auth.token) return;
        
        try {
            const response = await getSharedPlayers(props.handID, user.auth.token);
            const json = await response.json();
            setSharedPlayers(json);
        } catch (error) {
            console.error("Error fetching shared players:", error);
        }
    }, [user.auth.token, props.handID]);

    async function postShare() {
        if (!user.auth.token || !shareInput.trim()) return;
        
        try {
            await shareHand(props.handID, shareInput, user.auth.token);
            setShareInput(""); // Clear input after successful share
            fetchSharedPlayers(); // Refresh the list
        } catch (error) {
            console.error("Error sharing hand:", error);
        }
    }

    async function deleteShare(id: number) {
        if (!user.auth.token) return;
        
        try {
            await unshareHand(props.handID, id, user.auth.token);
            fetchSharedPlayers(); // Refresh the list
        } catch (error) {
            console.error("Error unsharing hand:", error);
        }
    }

    useEffect(() => {
        fetchSharedPlayers();
    }, [fetchSharedPlayers]);
    return (
        <div className="grid">
            <div className="py-8">
                <Link href={'/'} className="text-[#31D2DD] hover:underline">
                    <p>Search other hands</p>
                </Link>
            </div>

            <div className="grid grid-cols-2 pb-12 space-y-2">
                <div>
                    <h2 className="text-xl font-bold">
                        Hand ID: {props.handID}
                    </h2>
                    <p className="text-sm">
                        Table: {props.tableName}
                    </p>
                    <p className="text-sm">
                        Played At: {props.timestamp}
                    </p>

                </div>

                <div className="mr-12 pr-5 space-y-2 text-right">
                    {sharedPlayers.length > 0 && (
                        <>
                            <span className="text-sm py-2 pr-2">
                                Shared with:
                            </span>
                            {sharedPlayers.map((player: any) => (
                                <span key={player.id} className="text-sm py-2 pr-2">
                                    {player.username}
                                    <a href="javascript:void(0)" onClick={() => { deleteShare(player.id) }} className="px-1 text-red-500">×</a>
                                </span>
                            ))}


                        </>

                    )}

                    <div>
                        <Button className="float-right" onClick={() => { postShare() }} variant="secondary">Share Hand</Button>

                        <input
                            className="mr-2 block w-1/2 bg-[#2C2C2C] float-right rounded-md border border-[#879195]  py-[9px] pl-4 text-sm outline-2 placeholder:text-[#879195]"
                            style={{ width: "200px", marginTop: "0" }}
                            placeholder="Username or email"
                            defaultValue={shareInput}
                            onChange={(e) => {
                                setShareInput(e.target.value)
                            }}


                        />
                    </div><br />



                </div>

            </div>

        </div>
    );
};