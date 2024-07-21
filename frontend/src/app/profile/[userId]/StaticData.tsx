'use client';

interface StaticDataProps {
    username: string;
    email: string;
    created_at: string;
}

export default function StaticData(props: StaticDataProps) {
    return (
        <div>
            <h1>STATICS</h1>
            <h1>{props.username}</h1>
            <h1>{props.email}</h1>
            <h1>{props.created_at}</h1>
        </div>
    )
}