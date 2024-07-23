'use client';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

interface UploadsProps {
    list_of_uploads: Array<any>
    number_of_uploads: number
}

export default function Uploads(props: UploadsProps) {

    var uploads: Array<any> = [];

    for (var uppies = 0; uppies < props.number_of_uploads; uppies++) {
        // The filename in the database is a filepath. We need to cut it down.
        const filename = props.list_of_uploads[uppies][1]; // Removes the beginning filepath

        uploads.push(
            <TableRow>
                <TableCell>{filename}</TableCell> {/* Removes the file extension. */}
                <TableCell>{props.list_of_uploads[uppies][2]}</TableCell> {/* Width adjustment is manual. Forces highlight to end of row. */}
            </TableRow>
        );
    }

    return (
        <div>
            <div>
                <p className="text-xl pt-16">Uploads:</p>
                <Table>
                    <TableHeader className="text-[#31D2DD]">
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Upload Date</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {uploads}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
