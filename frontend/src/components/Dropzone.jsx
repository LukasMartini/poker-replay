"use client"

import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { Button } from './ui/button'


// TODO
// upload to db

const Dropzone = ({className}) => {
    const [files, setFiles] = useState([])

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length) {
            setFiles(previousFiles => [
                ...previousFiles,
                ...acceptedFiles.map(file => (
                    Object.assign(file, {preview: URL.createObjectURL(file)})
                ))
            ])
        }
    }, [])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop })

    const removeFile = (name) => {
        setFiles(files => files.filter(file => file.name !== name))
    }

    const handleSubmit = async e => {
        e.preventDefault();

        if (!files?.length) return

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
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag and drop your file(s)</p>
                )}
            </div>
            
            
            <ul className='pt-8 space-y-2'>
                {files.map(file => (
                    <li key={file.name} className='border p-4 rounded-md '>
                        <div className='flex justify-between'>
                            {file.name}
                            <button className='hover:underline' type='button' onClick={() => removeFile(file.name)}>
                                delete
                            </button>
                        </div>
                        
                    </li>
                ))}
            </ul>
        </form>
    )
}

export default Dropzone