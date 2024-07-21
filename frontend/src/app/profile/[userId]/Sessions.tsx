'use client';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL;

interface SessionsProps {
    list_of_sessions: Array<any>;
    number_of_sessions: number;
}

export default function Sessions(props: SessionsProps) {

    var sessions: Array<any> = [];

    const redirectToSesh = (e: any) => { // Will link to the associated session view page.
        window.location.href = `${ROOT_URL}session/${e}`;
    }

    for (var sesh = 0; sesh < props.number_of_sessions; sesh++) {
        const session_id = props.list_of_sessions[sesh][7];
        // The width corrections in each row are manual and eye-balled. Change at your discrection.
        sessions.push(<TableBody key={props.list_of_sessions[sesh][7]} onClick={() => redirectToSesh(session_id)}>
                        <TableRow>
                        <TableCell className="w-[165px]">{props.list_of_sessions[sesh][0]}</TableCell>
                        <TableCell className="w-[160px]">{props.list_of_sessions[sesh][1]}</TableCell>
                        <TableCell className="w-[155px]">{props.list_of_sessions[sesh][2]}</TableCell>
                        <TableCell className="w-[175px]">{props.list_of_sessions[sesh][3]}</TableCell>
                        <TableCell className="w-[130px]">{props.list_of_sessions[sesh][4]}</TableCell>
                        <TableCell className="w-[150px] text-xs">{props.list_of_sessions[sesh][5]}</TableCell>
                        <TableCell className="text-xs">{props.list_of_sessions[sesh][6]}</TableCell>
                        </TableRow>
                    </TableBody>);
    }

    return (
        <div>
            <div>
                <p className="text-xl">Sessions:</p>
                <Table> 
                    <TableHeader className="text-[#31D2DD]">
                        <TableRow>
                        <TableHead>Table Name</TableHead>
                        <TableHead>Game Type</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Total Hands</TableHead>
                        <TableHead>Max Players</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
            <div style={{height:"25vh", overflow:"scroll"}}>
                {sessions}
            </div>
        </div>
    )
}
