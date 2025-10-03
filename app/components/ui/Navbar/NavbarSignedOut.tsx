import Link from 'next/link';

export default function NavbarSignedOut() {
  return (
    <nav className="flex items-center justify-between bg-white text-black p-4 border-b border-gray-200 w-full">
      <Link className="text-3xl font-bold" href={"/"}>
        Vanguard
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium hover:underline">
          Login
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}