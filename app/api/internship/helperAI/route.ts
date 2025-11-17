import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 402 }
    );
  }

  try {
    
  } catch (error: any) {
    return NextResponse.json({
        message: 'An error occured during fetching the message',
        error: error.message
    }, {status: 500})
  }
}
