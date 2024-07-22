"use client"

import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { Button } from './ui/button'
import Image from 'next/image'
import { useAuth } from "@/components/auth/AuthContext";
import { uploadFiles } from '../util/api-requests'

const Dropzone = ({className}) => {
    const [files, setFiles] = useState([])
    const user = useAuth();

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length) {
            setFiles(previousFiles => [
                ...previousFiles,
                ...acceptedFiles.map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    size: file.size,
                    name: file.name
                }))
            ])
        }
    }, [])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({ 
        onDrop,
        accept: '.txt'
    })

    const formatFileSize = (size) => {
        if (size < 1024) return `${size} bytes`;
        else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
        else return `${(size / 1048576).toFixed(2)} MB`;
    }

    const removeFile = (name) => {
        setFiles(files => files.filter(file => file.name !== name))
    }

    const handleSubmit = async e => {
        e.preventDefault();
        if (!files?.length) return

        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file.file);
        });

        try {
            const res = await uploadFiles(formData, user.auth.token);

            if (res.ok) {
                const result = await res.json();
                alert(result.message);
                setFiles([]);
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error occurred while uploading');
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='py-4 w-full flex justify-end'>
                <Button type='submit'>Upload</Button>
            </div>
            <div 
                {...getRootProps({
                    className: className
                })}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <div className='text-center'>
                        <p>Drop your files here ...</p>
                    </div>
                ) : (
                    <div className='text-center'>
                        <p>Drag and drop your file(s)</p>
                        <p className='text-sm'>-or-</p>
                        <p>Click to upload</p>
                    </div>
                    
                )}
            </div>
            <p className='text-sm text-[#8F8F8F] mt-2'>Supported format: txt</p>
            
            
            <ul className='py-8 space-y-2'>
                {files.map(file => (
                    <li key={file.name} className='border border-[#2CBDC7] p-4 rounded-md '>
                        <div className='flex justify-between'>
                            <div className='flex items-center space-x-4'>
                                <Image src={"/file-icon.svg"} alt='file' width={32} height={32} />
                                <div className='pl-4'>
                                    <p>{file.name}</p>
                                    <p className='text-sm text-gray-500'>{formatFileSize(file.size)}</p>
                                </div>
                                
                            </div>
                            
                            <button className='transition ease-in-out delay-100 hover:scale-105' type='button' onClick={() => removeFile(file.name)}>
                                <Image src={"/delete.svg"} alt='delete' width={32} height={32} />
                            </button>
                        </div>
                        
                    </li>
                ))}
            </ul>
        </form>
    )
}

export default Dropzone