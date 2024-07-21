'use client';

interface UploadsProps {
    list_of_uploads: Array<any>
}

// TODO: format filename to only be the file name. Use regex to be general. 

export default function Uploads(props: UploadsProps) {
    return (
        <div>
            <h1>UPLOADS</h1>
            <h1>{props.list_of_uploads}</h1>
        </div>
    )
}