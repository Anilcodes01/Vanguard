const ProjectCardSkeleton = () => (
    <div className="bg-[#3b3b3b] rounded-lg shadow-lg animate-pulse">
        <div className="w-full h-48 bg-gray-600 rounded-t-lg"></div>
        <div className="p-6 space-y-4">
            <div className="w-3/4 h-6 bg-gray-600 rounded"></div>
            <div className="flex justify-between items-center">
                <div className="w-1/3 h-4 bg-gray-600 rounded-full"></div>
                <div className="w-1/4 h-4 bg-gray-600 rounded"></div>
            </div>
        </div>
    </div>
);


export default function FullProjectCardSkeleton() {

    return   <div className='flex flex-col items-center min-h-screen bg-[#262626] text-white p-8'>
            <div className="text-center mb-12 w-full max-w-6xl">
                <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto animate-pulse mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4 mx-auto animate-pulse"></div>
            </div>
            <div className='w-full max-w-6xl'>
                <div className="h-8 bg-gray-700 rounded w-1/3 animate-pulse mb-6"></div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                </div>
            </div>
        </div>
}