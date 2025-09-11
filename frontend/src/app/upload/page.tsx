'use client'

import Dropzone from "@/components/Dropzone"
import { useAuth } from "@/components/auth/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const UploadPage = () => {
    const { isDemoUser } = useAuth();

    if (isDemoUser) {
        return (
            <div className="bg-[#2C2C2C] text-white px-64">
                <h2 className="text-lg font-bold pt-8">
                    Upload Hand History
                </h2>
                <div className="mt-8 p-8 bg-[#292F30] rounded-md border border-[#879195]">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4 text-[#2CBDC7]">
                            Demo Account Limitation
                        </h3>
                        <p className="text-gray-300 mb-6">
                            Demo accounts cannot upload hand history files. This feature is restricted to preserve the demo data integrity.
                        </p>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                To upload your own hand histories, please create a regular account.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link href="/signup">
                                    <Button variant="gradient">Create Account</Button>
                                </Link>
                                <Link href="/">
                                    <Button variant="outline">Explore Demo</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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