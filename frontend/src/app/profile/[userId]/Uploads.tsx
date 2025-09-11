'use client';
import Image from "next/image";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteFile } from "@/util/api-requests";
import { useAuth } from '@/components/auth/AuthContext';


interface UploadsProps {
    list_of_uploads: Array<any>
    number_of_uploads: number
}

export default function Uploads(props: UploadsProps) {
    const user = useAuth();
    const token = user.auth.token;
    const isDemoUser = user.isDemoUser;

    const handleDelete = (file_id: string) => {
        if (isDemoUser) {
            alert("Demo users cannot delete files. Please create a regular account for full functionality.");
            return;
        }

        deleteFile(file_id, token)
            .then(response => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error deleting file:', error);
            });
    };

    const uploads = (props.list_of_uploads || []).map((upload) => {
        return (
            <TableRow key={upload[0]}>
                <TableCell>{upload[1]}</TableCell> {}
                <TableCell>{upload[2]}</TableCell> {}
                <TableCell>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className={`transition ease-in-out delay-100 ${
                      isDemoUser 
                        ? "opacity-40 cursor-not-allowed" 
                        : "hover:scale-110"
                    }`}
                    type="button"
                    disabled={isDemoUser}
                  >
                    <Image 
                      src={"/delete.svg"} 
                      alt={isDemoUser ? "Delete disabled for demo users" : "delete"} 
                      width={32} 
                      height={32} 
                    />
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="border-b border-[#879195] pb-4">
                      {isDemoUser ? "Feature Restricted" : `Delete ${upload[1]}?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="py-8 text-center">
                      {isDemoUser 
                        ? "Demo users cannot delete files. Please create a regular account to access this feature."
                        : "Confirming will delete the selected file and all associated data. This action cannot be undone."
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-2 pt-4">
                    <AlertDialogCancel>
                      {isDemoUser ? "Close" : "No, cancel"}
                    </AlertDialogCancel>
                    {!isDemoUser && (
                      <AlertDialogAction 
                        className="bg-[#FF8E8A] text-black font-semibold hover:bg-[#da5d59]" 
                        onClick={() => handleDelete(upload[0])}
                      >
                        Yes, delete
                      </AlertDialogAction>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
                </TableCell>
            </TableRow>
        );
    });

    return (
        <div className="pb-8">
            <p className="text-xl pt-16">Uploads:</p>
            <Table>
                <TableHeader className="text-[#31D2DD]">
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Delete data</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {uploads}
                </TableBody>
            </Table>
        </div>
    )
}