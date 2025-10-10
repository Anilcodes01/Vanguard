
    import Link from 'next/link';

    export default function NotFound() {
      return (
        <div className='flex items-center justify-center bg-[#262626] text-white min-h-screen'>
      <div className='flex flex-col gap-4 items-center justify-center'>
            <h2>Not Found</h2>
          <p>Could not find requested resource</p>
          <Link className='bg-green-400 cursor-pointer rounded-2xl px-4 py-2 hover:bg-green-500 transition-colors duration-300' href="/">Return Home</Link>
      </div>
        </div>
      );
    }