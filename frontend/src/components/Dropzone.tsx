"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { uploadFiles } from "../util/api-requests";
import { useToast } from "./ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface DropzoneProps {
  className?: string;
}

interface FilePreview {
  file: File;
  preview: string;
  size: number;
  name: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ className }) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        size: file.size,
        name: file.name,
      }));

      // Filter out files with duplicate names
      const uniqueFiles = newFiles.filter((newFile) =>
        !files.some((existingFile) => existingFile.name === newFile.name)
      );

      if (uniqueFiles.length) {
        setFiles((previousFiles) => [
          ...previousFiles,
          ...uniqueFiles,
        ]);
      }
    }
  }, [files]);

  const accept: Accept = {
    'text/plain': ['.txt'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
  });

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} bytes`;
    else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / 1048576).toFixed(2)} MB`;
  };

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files?.length) return;

    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file.file);
    });

    try {
      const res = await uploadFiles(formData, user.auth.token);

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Success!",
          description: result.message,
        });
        setFiles([]);
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to upload file(s)",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "Error occurred while uploading",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="py-4 w-full flex">
        <Button variant="gradient" className="w-32" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <div {...getRootProps({ className: `${className} border-2 border-dashed border-[#2CBDC7] p-4 rounded-md`, })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="text-center">
            <p>Drop your files here ...</p>
          </div>
        ) : (
          <div className="text-center">
            <p>Drag and drop your file(s)</p>
            <p className="text-sm">-or-</p>
            <p>Click to upload</p>
          </div>
        )}
      </div>
      <p className="text-sm text-[#8F8F8F] mt-3">Supported format: txt</p>

      <ul className="py-8 space-y-2">
        {files.map((file) => (
          <li key={file.name} className="border border-[#2CBDC7] p-4 rounded-md ">
            <div className="flex justify-between">
              <div className="flex items-center space-x-4">
                <Image src={"/file-icon.svg"} alt="file" width={32} height={32} />
                <div className="pl-4">
                  <p>{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="transition ease-in-out delay-100 hover:scale-110"
                    type="button"
                  >
                    <Image src={"/delete.svg"} alt="delete" width={32} height={32} />
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="border-b border-[#879195] pb-4">{`Delete ${file.name}?`}</AlertDialogTitle>
                    <AlertDialogDescription className="py-8 text-center">
                      Confirming will delete the selected file and all associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-2 pt-4">
                    <AlertDialogCancel>No, cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-[#FF8E8A] text-black font-semibold hover:bg-[#da5d59]" onClick={() => removeFile(file.name)}>Yes, delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </div>
          </li>
        ))}
      </ul>
    </form>
  );
};

export default Dropzone;
