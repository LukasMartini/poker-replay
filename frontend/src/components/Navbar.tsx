'use client';
import Link from "next/link"
import { Button } from './ui/button'
import { useAuth } from '@/components/auth/AuthContext';
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Image from "next/image";

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
        <text x="40" y="25" fontWeight="bold" fontSize="20" fill="white">PokerReplay</text>

      </g>
      </svg>
  
    )
}

const Navbar = () => {
    const {auth, logout} = useAuth();
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    };

    return (
        <div className="w-full bg-[#2C2C2C] text-white py-4 px-8 shadow-md flex items-center justify-between top-0 sticky z-50">
            <Link href={'/'}>
                <>    
                <Logo/>            
                {/* <h2 className="float-left text-2xl font-bold">
                   
                    PokerReplay
                </h2> */}

                </>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
                <Link href={'/'} className="hover:underline">
                    <p className="text-sm">
                        Search hand
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
                            <Button variant="outline" className="ml-2" type='submit'>Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger>
                        <Image src={'/Menu.svg'} alt="menu" width={20} height={20} />
                    </SheetTrigger>
                    <SheetContent>
                        <div className="flex flex-col space-y-8 py-8 px-4">
                            <Link href={'/'} onClick={handleLinkClick}>
                                <p className="text-sm hover:underline">Search hand</p>
                            </Link>
                            <Link href={'/bankroll'} onClick={handleLinkClick}>
                                <p className="text-sm hover:underline">Bankroll</p>
                            </Link>
                            <Link href={'/upload'} onClick={handleLinkClick}>
                                <p className="text-sm hover:underline">Add history</p>
                            </Link>
                            {auth.token ? (
                                <Button onClick={() => { handleLinkClick(); logout(); }} variant="secondary">
                                    Logout
                                </Button>
                            ) : (
                                <div className="flex flex-col pt-8 space-y-4">
                                    <Link href={'/login'} onClick={handleLinkClick}>
                                        <Button variant="secondary" className="w-full">Login</Button>
                                    </Link>
                                    <Link href={'/signup'} onClick={handleLinkClick}>
                                        <Button type='submit' className="w-full">Sign Up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}

export default Navbar;