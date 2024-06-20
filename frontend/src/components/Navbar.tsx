import Link from "next/link"

const Navbar = () => {
    return (
        <div className="w-full bg-[#2C2C2C] text-white py-4 px-8 shadow-md flex items-center justify-between">
            <Link href={'/'}>
                <h2 className="text-2xl font-bold">
                    PokerReplay
                </h2>
            </Link>

            <div className="flex items-center space-x-8">
                <Link href={'/'} className="hover:underline">
                    <p className="text-sm">
                        Search hand
                    </p>
                </Link>
                <Link href={'/bankroll'} className="hover:underline">
                    <p className="text-sm">
                        Bankroll
                    </p>
                </Link>
                <Link href={'/upload'} className="hover:underline">
                    <p className="text-sm">
                        Add history
                    </p>
                </Link>
            </div>
            
        </div>
    )
}

export default Navbar