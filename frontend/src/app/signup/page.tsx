'use client';

import { Button } from '@/components/ui/button';
import { signupUser } from '@/util/api-requests';
import Link from 'next/link';

const handleSubmit = async (event: any) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-\+=~`{}$begin:math:display$$end:math:display$|\\:;"'<,>.?/]).{12,}$/;

  if (!emailRegex.test(formData.get("email") as string)) {
    alert("Please enter a valid email address (example@example.com)");
    return;
  }
  if (!passwordRegex.test(formData.get("password") as string)) {
    alert("Please enter a minimum 12 character password including a number and special character.");
    return;
  }
  if (formData.get("password") != formData.get("confirm_password")) {
    alert("Confirm Password doesn't match your password");
    return;
  }


  const response = await signupUser(formData);

  window.location.reload();

  console.log(await response.json());
};

const SignupPage = () => {
  return (
    <div className="bg-[#2C2C2C] text-white px-64">
      <h1 className="text-xl text-center  font-bold pt-8">
          Sign up for PokerReplay
      </h1>
      <br/><br/>
      <form encType='multipart/form-data' onSubmit={handleSubmit} className="mx-auto w-full max-w-xs space-y-4 bg-[#2C2C2C]">
        <input
          className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm"
          type="email"
          name="email"
          placeholder="Email address"
        />
        <input
          className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm "
          type="text"
          name="username"
          placeholder="Username"
        />
        <input
          className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm"
          type="password"
          name="password"
          placeholder="Password"
        />
        <input
          className="w-full bg-[#2C2C2C] rounded-md border border-[#879195] py-2 px-4 text-sm"
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
        />
        <Button className="w-full" variant="gradient" type='submit'>Sign Up</Button>
        <div className="flex flex-cols justify-center px-12 text-xs">
              <h1>Already have an account?</h1>
              <h1>&nbsp;</h1>
              <Link className="font-semibold cursor-pointer hover:underline" href={'login'}>Log in</Link>
        </div>
      </form>
    </div>
  )
}

export default SignupPage