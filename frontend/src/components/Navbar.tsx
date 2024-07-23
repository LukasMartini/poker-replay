'use client';
import Link from "next/link"
import { Button } from './ui/button'
import { useAuth } from '@/components/auth/AuthContext';

const Navbar = () => {
    const {auth, logout} = useAuth();
    
    return (
        <div className="w-full bg-[#2C2C2C] text-white py-4 px-8 shadow-md flex items-center justify-between top-0 sticky z-50">
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
                <Link href={`/profile/${auth.username}`}>
                    <p className="text-sm">
                        Profile
                    </p>
                </Link>

            </div>
                {auth.token && (
                    <Button onClick={()=>logout()} variant="secondary">Logout</Button>
                )}

                {!auth.token && (
                    <div>
                        <Link href={'/login'}>
                            <Button variant="secondary">Login</Button>
                        </Link>
                        <Link href={'/signup'}>
                            <Button variant="outline" className="ml-2" type='submit'>Sign Up</Button>
                        </Link>
                    </div>
                )}
        </div>
    )
}

export default Navbar