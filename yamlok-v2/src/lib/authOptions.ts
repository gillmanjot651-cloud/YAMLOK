import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const stored = process.env.ADMIN_PASSWORD;
        if (!stored || !credentials?.password) return null;

        // Support both plain-text and bcrypt hashes
        const match = stored.startsWith('$2')
          ? await bcrypt.compare(credentials.password, stored)
          : credentials.password === stored;

        if (match) return { id: '1', name: 'Admin' };
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8-hour session
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
