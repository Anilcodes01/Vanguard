import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // This response object is used to enrich the request headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // If user is logged in
  if (user) {
    // Call the database function to get the onboarding status
    const { data: isOnboarded, error } = await supabase
      .rpc('get_onboarding_status', { user_id: user.id });

    if (error) {
      console.error('Middleware RPC error:', error.message);
      // Let the request proceed if there's an error, to avoid blocking the whole app
      return response;
    }

    // If user is NOT onboarded and is trying to access any page OTHER THAN the onboarding page
    if (!isOnboarded && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If user IS onboarded and tries to access the onboarding page again
    if (isOnboarded && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If user is not logged in and tries to access a protected page (e.g., onboarding)
  if (!user && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};