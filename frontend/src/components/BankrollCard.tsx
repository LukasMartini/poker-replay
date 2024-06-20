interface BankrollCardProps {
    title: string;
    subtitle: string;
}

const BankrollCard = (props: BankrollCardProps) => {
    return (
        <div className="bg-[#2C2C2C] border border-[#879195] text-white text-sm rounded-md shadow-md px-12 py-8 text-center">
                <h2 className="text-white font-bold text-xl">
                    {props.title}
                </h2>
                <p className="pt-3  text-[#879195]">
                    {props.subtitle}
                </p>   
        </div>
    )
}

export default BankrollCard