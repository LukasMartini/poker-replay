import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


// TODO:
// display hand id, user id, table name
// get hand details from backend and display in table rows

const HandDetails = () => {
    return (
        <div className="bg-[#2C2C2C] text-white px-32">
            <div className="py-8">
                <Link href={'/'} className="text-[#31D2DD] hover:underline">
                    <p>Search other hands</p>
                </Link>
            </div>

            <div className="pb-12 space-y-2">
                <h2 className="text-xl font-bold">
                    Hand ID:
                </h2>
                <p className="text-sm">
                    Player ID:
                </p>
                <p className="text-sm">
                    Table: 
                </p>
            </div>
            

            <div>
                <Table>
                    <TableHeader className="text-[#31D2DD]">
                        <TableRow>
                        <TableHead >Stage</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="w-[100px]">Chips</TableHead>
                        <TableHead className="w-[100px]">Hand</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                        <TableCell className="font-medium">Preflop</TableCell>
                        <TableCell>Small Blink $0.01</TableCell>
                        <TableCell>bouchizzle</TableCell>
                        <TableCell className="w-[100px]">$1.98</TableCell>
                        <TableCell className="w-[100px]"></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default HandDetails