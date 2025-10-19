import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, we'll use a simple authentication
        // In a real app, you would hash passwords and use proper authentication
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              student: true
            }
          });

          if (!user) {
            // Create a default user if not exists (for demo purposes)
            const newUser = await db.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: credentials.email.includes('teacher') ? 'TEACHER' : 'STUDENT'
              }
            });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role
            };
          }

          // Simple password check (in real app, use proper password hashing)
          if (credentials.password === 'demo123') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            };
          }

          return null;
        } catch (error) {
          console.error('Error in authorize function:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};