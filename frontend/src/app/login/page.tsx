'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { loginUser } from '@/lib/api-requests';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    <div className="bg-[#2C2C2C] text-white px-64">
      {user.auth.token && ( 
        <div>
          <h1 className="text-xl text-center  font-bold pt-8">
            Logged in!
          </h1>

          <Button className="w-full" onClick={()=>user.logout()}>Logout</Button>
          </div>
      )}
      {!user.auth.token && (
        <div>
          <h1 className="text-xl text-center  font-bold pt-8">
              Login to PokerReplay
          </h1>
          <br/><br/>
          <form encType='multipart/form-data' onSubmit={handleSubmit} className="mx-auto max-w-xs p-8 space-y-4 bg-[#232323] rounded-lg shadow-md">
            <input
              className="w-full bg-gray-800 rounded-md border border-gray-400 py-2 px-4 text-sm text-white placeholder-gray-400"
              type="text"
              name="username"
              placeholder="Email or username"
            />
            <input
              className="w-full bg-gray-800 rounded-md border border-gray-400 py-2 px-4 text-sm text-white placeholder-gray-400"
              type="password"
              name="password"
              placeholder="Password"
            />
            <Button className="w-full" type='submit'>Login</Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default LoginPage