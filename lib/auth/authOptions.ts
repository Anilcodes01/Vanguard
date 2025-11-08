import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "../supabaseClient";

interface CustomUser {
  id: string;
  email: string;
  name: string;
}

interface CustomSession {
  user: {
    id: string;
    email: string;
  };
  expires: string;
}

const authHandlers = {
  async handleSignup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL}`,
      },
    });

    if (error) {
      console.error("[AUTH] Signup error:", error);
      throw new Error(error.message);
    }

    if (!data.user?.id) {
      throw new Error(
        "Signup successful. Please check your email for confirmation."
      );
    }
    return data.user;
  },

  async handleSignin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[AUTH] Signin error:", error);
      throw new Error(error.message);
    }

    if (!data.user?.id) {
      throw new Error("Invalid credentials");
    }

    return data.user;
  },

  async handleResetPassword() {
  },
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password (if required)",
        },
        mode: {
          label: "Mode",
          type: "text",
          placeholder: "signin, signup, or resetpassword",
        },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
            
          if (!credentials) {
            throw new Error("Missing credentials");
          }

          if (credentials.mode === "resetpassword") {
      try {
        const {  error } = await supabase.auth.resetPasswordForEmail(
          credentials.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
          }
        );
        
        if (error) throw error;
        
        return null;
      } catch (error) {
        console.error("Reset password error:", error);
        throw new Error("Failed to send reset password email");
      }
    }

    
          const { email, password, mode } = credentials;
          const lowerMode = mode?.toLowerCase();

          if (!email || !password) {
            throw new Error("Password is required to signin or signup.");
          }
          const user =
            lowerMode === "signup"
              ? await authHandlers.handleSignup(email, password)
              : await authHandlers.handleSignin(email, password);

          return {
            id: user.id,
            email: user.email ?? email,
            name: user.email ?? email,
          };
        } catch (error) {
          console.error("[AUTH] Authorization error:", {
            error,
            email: credentials?.email,
            mode: credentials?.mode,
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token.userId = user.id),
          (token.email = user.email),
          (token.lastUpdated = new Date().toISOString());
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          id: token.userId as string,
          email: token.email as string,
        },
      };
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  events: {
    async signIn({user}) {
        console.log('[AUTH] Successful sign-in:', {
            userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
        })
    },
    async signOut({ token }) {
    if (token?.userId) {
      await supabase.auth.signOut();
    }
  },
  },
secret: process.env.AUTH_SECRET,
debug: process.env.NODE_ENV === 'development',
};
