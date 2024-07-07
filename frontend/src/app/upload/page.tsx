import Dropzone from "@/components/Dropzone"

const UploadPage = () => {
    return (
        <div className="bg-[#2C2C2C] text-white px-64">
            <h2 className="text-lg font-bold pt-8">
                Upload Hand History
            </h2>

            <Dropzone className="h-52 border flex items-center justify-center border-[#2CBDC7] bg-[#292F30] rounded-md cursor-pointer" />

        </div>
    )
}

export default UploadPage