import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

type SessionTableProps = {
    data: Array<{
        id: number,
        upload_id: number,
        buy_in: number,
        table_name: string,
        game_type: string,
        currency: string,
        total_hands: number,
        max_players: number,
        start_time: string,
        end_time: string,
    }>;
};

const SessionTable: React.FC<SessionTableProps> = ({ data }) => {
    return (
        <div className="pt-8">
            <Table>
                <TableHeader className="text-[#31D2DD]">
                    <TableRow>
                        <TableCell>Upload ID</TableCell>
                        <TableCell>Buy In</TableCell>
                        <TableCell>Table Name</TableCell>
                        <TableCell>Game Type</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Total Hands</TableCell>
                        <TableCell>Max Players</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((info, index) => (
                        <TableRow key={index} className='cursor-pointer' onClick={() => window.open(`/session/${info.id}`, "_blank")}>
                            <TableCell>{info.upload_id}</TableCell>
                            <TableCell>{info.buy_in}</TableCell>
                            <TableCell>{info.table_name}</TableCell>
                            <TableCell>{info.game_type}</TableCell>
                            <TableCell>{info.currency}</TableCell>
                            <TableCell>{info.total_hands}</TableCell>
                            <TableCell>{info.max_players}</TableCell>
                            <TableCell>{info.start_time}</TableCell>
                            <TableCell>{info.end_time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SessionTable;
