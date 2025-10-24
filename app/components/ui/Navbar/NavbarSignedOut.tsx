'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // useRouter is imported but not used, can be removed if not needed.

export default function NavbarSignedOut() {
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
    <nav className="flex items-center justify-around bg-[#262626] text-white py-2 px-4 border-b border-neutral-800 w-full">
      <Link className="text-2xl font-bold" href={"/"}>
       <Image src={'/adapt.png'} alt='adapt logo' width={200} height={200} className='h-8 w-8' />
      </Link>

      <div className='hidden md:flex items-center gap-8 text-neutral-300'>
        {links.map((link)  =>(
          <Link  
            className='cursor-pointer text-sm transition-colors hover:text-white' 
            href={link.path} 
            key={link.key}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#262626] focus:ring-sky-500"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#262626] focus:ring-sky-500"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}