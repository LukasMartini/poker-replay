import Link from "next/link";
import React, { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
interface MetaDataProps {
    handID: string;
    tableName: string;
    timestamp: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MetaData(props: MetaDataProps) {
    const [sharedPlayers, setSharedPlayers] = useState([]);
    const [shareInput, setShareInput] = useState("");

    async function getSharedPlayers() {
        const response = await fetch(`${API_URL}share?hand_id=${props.handID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
        setSharedPlayers(json);
    }
    async function postShare() {
        await fetch(`${API_URL}share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                hand_id: props.handID,
                shared_user: shareInput
            })
        });

        getSharedPlayers();
    }

    async function deleteShare(id: number) {
        await fetch(`${API_URL}share`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                hand_id: props.handID,
                shared_id: id
            })
        });

        getSharedPlayers();
    }


    useEffect(() => {
        getSharedPlayers();
    }, []);
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
                                <span className="text-sm py-2 pr-2">
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