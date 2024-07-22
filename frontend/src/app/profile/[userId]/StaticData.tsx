'use client';

interface StaticDataProps {
    username: string;
    email: string;
    created_at: string;
}

export default function StaticData(props: StaticDataProps) {

    return (
        <div>
            <p className="text-7xl">{props.username}</p>
            <p className="text-2xl">{props.email}</p>
            <p>Created On: {props.created_at}</p>
        </div>
    )
}