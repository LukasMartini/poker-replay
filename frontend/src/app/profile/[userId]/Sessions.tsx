'use client';

interface SessionsProps {
    list_of_sessions: Array<any>;
}

export default function Sessions(props: SessionsProps) {
    return (
        <div>
            <h1>SESSIONS</h1>
            <h1>{props.list_of_sessions}</h1>
        </div>
    )
}
