import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

type SessionTableProps = {
    data: Array<{
        hand_id: string;
        played_at: string;
        table_name: string;
        amount: number;
    }>;
};

const SessionTable: React.FC<SessionTableProps> = ({ data }) => {
    return (
        <div className="pt-8">
            <Table>
                <TableHeader className="text-[#31D2DD]">
                    <TableRow>
                        <TableCell>Hand ID</TableCell>
                        <TableCell>Played At</TableCell>
                        <TableCell>Table Name</TableCell>
                        <TableCell>Amount</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((info, index) => (
                        <TableRow key={index}>
                            <TableCell>{info.hand_id}</TableCell>
                            <TableCell>{info.played_at}</TableCell>
                            <TableCell>{info.table_name}</TableCell>
                            <TableCell>{info.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SessionTable;
