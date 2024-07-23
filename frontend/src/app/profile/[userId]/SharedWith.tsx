'use client';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL;


export default function SharedWith(props: any) {

    var sessions: Array<any> = [];

    const redirectToSesh = (e: any) => { // Will link to the associated session view page.
        window.location.href = `${ROOT_URL}/${e}`;
    }

    console.log(props.list_of_sessions);

    for (var sesh = 0; sesh < props.list_of_sessions.length; sesh++) {
        const session_id = props.list_of_sessions[sesh].id;
        // The width corrections in each row are manual and eye-balled. Change at your discrection.
        sessions.push(
                        <TableRow  style={{cursor: "pointer"}} onClick={() => redirectToSesh(session_id)} >
                        <TableCell className="w-[165px]">{props.list_of_sessions[sesh].username}</TableCell>
                        <TableCell className="w-[160px]">{props.list_of_sessions[sesh].id}</TableCell>
                        <TableCell className="w-[160px]">{props.list_of_sessions[sesh].played_at}</TableCell>
                        <TableCell className="w-[160px]">{props.list_of_sessions[sesh].small_blind}/{props.list_of_sessions[sesh].big_blind}</TableCell>


                        </TableRow>
                   );
    }

    return (
        <div>
            <div>
                <p className="text-xl">Shared With You:</p>
                <Table> 
                    <TableHeader className="text-[#31D2DD]">
                        <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>Hand ID</TableHead>
                        <TableHead>Played At</TableHead>
                        <TableHead>Details</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody >
                    {sessions}

                    </TableBody>
                </Table>
            </div>
            <div style={{height:"25vh", overflow:"scroll"}}>
            </div>
        </div>
    )
}
