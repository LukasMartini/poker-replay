import Link from "next/link";

interface HandCardProps {
    handId: string;
    userId: string;
    tableName: string;
}

const HandCard = (props: HandCardProps) => {
    return (
        <div className="bg-[#2C2C2C] border border-[#879195] text-white text-sm rounded-md shadow-md px-12 py-4 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300">
            <Link href={`/${props.handId}`}>
                <h2 className="hover:underline">
                    {props.handId}
                </h2>
                <p className="py-3">
                    {props.userId}
                </p>   
                <p>
                    {props.tableName}
                </p>
            </Link>
        </div>

    )
}

export default HandCard