"use client"
import { useSearchParams, usePathname, useRouter } from "next/navigation"

const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = (searchTerm: string) => {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set("query", searchTerm);
        } 
        else {
            params.delete("query");
        }
        replace(`${pathname}?${params.toString()}`)
    }
    return (
        <div className="relative">
            <input 
                className="peer block w-1/2 bg-[#2C2C2C] rounded-md border border-[#879195] py-[9px] pl-4 text-sm outline-2 placeholder:text-[#879195]"
                placeholder="Search hands"
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => {
                    handleSearch(e.target.value)
                }}
            />
        </div>
    )
}

export default SearchBar