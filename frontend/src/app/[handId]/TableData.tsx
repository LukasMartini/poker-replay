import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import React from "react";

interface TableDataProps {
    betting_round: string;
    betting_amount: string;
    player_name: string;
    card_1: string;
    card_2: string;
}

export default function TableData (props: TableDataProps) {
        return(
                <TableBody>
                    <TableRow>
                    <TableCell className="font-medium">{props.betting_round}</TableCell>
                    <TableCell>{props.betting_amount}</TableCell>
                    <TableCell>{props.player_name}</TableCell>
                    <TableCell className="w-[100px]">{props.card_1}</TableCell>
                    <TableCell className="w-[100px]">{props.card_2}</TableCell>
                    </TableRow>
                </TableBody>
        );
};