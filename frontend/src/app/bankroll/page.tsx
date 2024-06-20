import BankrollCard from "@/components/BankrollCard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// TODO
// update card data with data
// update table rows with data

const test = [
    {
        title: "$2.09 CAD",
        subtite: "BALANCE",
        color: "white",
    },
    {
        title: "$2.09 CAD",
        subtite: "LAST SESSION CHANGE",
        color: "[#A4E76A]",
    },
    {
        title: "$2.09 CAD",
        subtite: "TOTAL PROFIT",
        color: "white",
    },
  ];

const Bankroll = () => {
    return (
        <div className="bg-[#2C2C2C] text-white px-32">
            <h2 className="text-xl font-bold  pt-8">
                Overview
            </h2>

            <div className="grid grid-cols-3 gap-20 py-12">
                {test.map((info, index) => (
                    <BankrollCard title={info.title} subtitle={info.subtite} key={index} />
                ))}
            </div>

            <div>
                <Table>
                    <TableHeader className="text-[#31D2DD]">
                        <TableRow>
                        <TableHead >Hand ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                        <TableCell className="font-medium">#246222355402</TableCell>
                        <TableCell>2023-09-27</TableCell>
                        <TableCell>Folded pre-flop</TableCell>
                        <TableCell>-$0.02</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default Bankroll