'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { loginUser } from '@/util/api-requests';
import Link from 'next/link';



const LoginPage = () => {
  const user = useAuth();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);
    const response = await loginUser(formData);
  
    const result = await response.json();
  
    if (result.success) {
      user.login(result.token, result.email, result.username);
    }
  };
  console.log(user.auth);

  return (
    <div className="bg-[#2C2C2C] text-white">
      {user.auth.token && ( 
        <div>
          <h1 className="text-xl text-center font-bold pt-8">
            Logged in!
          </h1>

          <Button className="w-full" onClick={()=>user.logout()}>Logout</Button>
          </div>
      )}
      {!user.auth.token && (
        <div className="w-full">
          <h1 className="text-xl text-center font-bold pt-8">
              Login to PokerReplay
          </h1>
          <br/><br/>
          <form encType='multipart/form-data' onSubmit={handleSubmit} className="mx-auto w-full max-w-xs space-y-4 bg-[#2C2C2C]">
            <input
              className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm text-white"
              type="text"
              name="username"
              placeholder="Email or username"
            />
            <input
              className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm text-white"
              type="password"
              name="password"
              placeholder="Password"
            />
            <Button className="w-full" variant="gradient" type='submit'>Login</Button>
            <div className="flex flex-cols px-16 text-xs">
              <h1>Don't have an account?</h1>
              <h1> &nbsp; </h1>
              <Link className="font-semibold cursor-pointer hover:underline" href='signup'>Sign up</Link>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default LoginPage