'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavbarSignedOut() {
  const router = useRouter();

  const links = [
    {
      key: 'explore',
      name:'Explore',
      path: '/explore'
    },
    {
      key: 'problems',
      name: 'Problems',
      path: '/problems'
    },
    {
      key: 'product',
      name: 'Product',
      path: '/product'
    },
    {
      key: 'developer',
      name: 'Developer',
      path: '/developer'
    }
  ]

  return (
    <nav className="flex items-center justify-around bg-[#262626] text-black py-2 px-4 border-b border-gray-200 w-full">
      <Link className="text-2xl font-bold" href={"/"}>
       <Image src={'/adapt.png'} alt='adapt logo' width={200} height={200} className='h-8 w-8' />
      </Link>

      <div className='flex gap-8'>
        {links.map((link)  =>(
          <Link  className='cursor-pointer hover:text-gray-500' href={link.path} key={link.key}>
            {link.name}
          </Link>
        ))}
      </div>
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