'use client'

import Image from "next/image"


type UserProfilePanel = {
    name: string | null,
    username: string | null,
    domain: string | null,
    college_name: string | null,
    avatar_url : string | null
}

export default function ProfilePanel({user} : {user: UserProfilePanel}) {
    console.log('User: ', user)

    return <div className="flex w-full bg-gray-400 text-white rounded-lg py-8 justify-center ">

          <div className="flex flex-col gap-4 items-center justify-center">
          <div className="border rounded-full border-gray-400">
              <Image src={user.avatar_url || ""} alt="avatar" width={200} height={200} className="h-20 w-20 border rounded-full" />
          </div>
           <div className="flex flex-col items-center justify-center">
              <h1 className="text-base ">
            {user.name}
           </h1>
           <h4>
            {user.username}
           </h4>
           </div>
          </div>
    </div>
}