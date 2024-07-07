import Link from "next/link";
import React from "react";

interface MetaDataProps {
    handID: string;
    tableName: string;
    timestamp: string;
}

export default function MetaData (props: MetaDataProps) {
        return (
            <div>
                <div className="py-8">
                    <Link href={'/'} className="text-[#31D2DD] hover:underline">
                        <p>Search other hands</p>
                    </Link>
                </div>

                <div className="pb-12 space-y-2">
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
            </div>
        );
};