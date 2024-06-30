import { Button } from '@/components/ui/button';

const LoginPage = () => {
  return (
    <div className="bg-[#2C2C2C] text-white px-64">
      <h1 className="text-xl text-center  font-bold pt-8">
          Login to PokerReplay
      </h1>
      <br/><br/>
      <form className="mx-auto max-w-xs p-8 space-y-4 bg-[#232323] rounded-lg shadow-md">
        <input
          className="w-full bg-gray-800 rounded-md border border-gray-400 py-2 px-4 text-sm text-white placeholder-gray-400"
          type="email"
          placeholder="Username"
        />
        <input
          className="w-full bg-gray-800 rounded-md border border-gray-400 py-2 px-4 text-sm text-white placeholder-gray-400"
          type="password"
          placeholder="Password"
        />
        <Button className="w-full" type='submit'>Login</Button>
      </form>
    </div>
  )
}

export default LoginPage