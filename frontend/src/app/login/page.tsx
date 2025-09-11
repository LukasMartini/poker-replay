'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { loginUser, loginDemoUser } from '@/util/api-requests';
import Link from 'next/link';



const LoginPage = () => {
  const user = useAuth();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await loginUser(formData);
  
    const result = await response.json();
  
    if (result.success) {
      user.login(result.token, result.email, result.username);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const response = await loginDemoUser();
      const result = await response.json();
      
      if (result.success) {
        user.login(result.token, result.email, result.username);
      } else {
        alert("Demo login failed. Please try again.");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      alert("Demo login failed. Please try again.");
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
            
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-600" />
              <span className="px-3 text-xs text-gray-400">or</span>
              <hr className="flex-1 border-gray-600" />
            </div>
            
            <button 
              type="button" 
              onClick={handleDemoLogin}
              className="w-full py-2 px-4 text-sm border border-gray-600 rounded-md hover:border-gray-500 transition-colors text-gray-300 hover:text-white"
            >
              Continue with Demo Account
            </button>
            
            <div className="flex justify-center text-xs pt-4">
              <span className="text-gray-400">Don&apos;t have an account?</span>
              <Link className="ml-1 font-semibold cursor-pointer hover:underline text-white" href='signup'>
                Sign up
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default LoginPage