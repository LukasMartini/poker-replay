'use client';
import Link from "next/link"
import { Button } from './ui/button'
import { useAuth } from '@/components/auth/AuthContext';

const Logo = () => {
    return (
        <svg  width="200px" height="50px">
        <g transform="translate(10, 10)">
        <g transform="rotate(-10, 9, 15)">
          <rect x="0" y="0" width="18" height="30" fill="white" strokeWidth="0.5" rx="2" stroke="black" />
          
              <text x="2" y="7" fontSize="6" fill="red">7</text>
              <text x="5" y="20" fontSize="15" fill="red">♥</text>
        
        </g>
        <g transform="translate(15, 0), rotate(10, 9, 15)">
          <rect x="0" y="0" width="18" height="30" fill="white" strokeWidth="0.5" rx="2" stroke="black" />
              <text x="2" y="7" fontSize="6" fill="black">2</text>
              <text x="5" y="20" fontSize="15" fill="black">♣</text>
        </g>
        <text x="40" y="25" font-weight="bold" fontSize="20" fill="white">PokerReplay</text>

      </g>
      </svg>
  
    )
}

const Navbar = () => {
    const {auth, logout} = useAuth();
    
    return (
        <div className="w-full bg-[#2C2C2C] text-white py-4 px-8 shadow-md flex items-center justify-between">
            <Link href={'/'}>
                <>    
                <Logo/>            
                {/* <h2 className="float-left text-2xl font-bold">
                   
                    PokerReplay
                </h2> */}

                </>
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
                {auth.token && (
                    <>
                        <Link href={`/profile/${auth.username}`}>
                            <p className="text-sm">
                                Profile ({auth.username})
                            </p>
                        </Link>

                        <Button onClick={()=>logout()} variant="secondary">Logout</Button>
                    </>
                )}

                {!auth.token && (
                    <div>
                        <Link href={'/login'}>
                            <Button variant="secondary">Login</Button>
                        </Link>
                        <Link href={'/signup'}>
                            <Button className="ml-2" type='submit'>Sign Up</Button>
                        </Link>
                    </div>
                )}

            </div>

        </div>
    )
}

export default Navbar