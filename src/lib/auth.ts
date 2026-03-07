import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { generateVerificationCode, sendVerificationCode } from "./email";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

// Wrap PrismaAdapter: keep account-linking methods for Google OAuth,
// override createUser to skip auto-verified emails, and provide
// no-op session methods since we use JWT-only mode.
const basePrismaAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: {
    ...basePrismaAdapter,
    // Override createUser to never auto-set emailVerified.
    // Users must verify via our 6-digit code flow.
    createUser: async (data) => {
      const { emailVerified: _ignored, ...rest } = data as unknown as Record<string, unknown>;
      return prisma.user.create({
        data: {
          email: rest.email as string,
          name: (rest.name as string) || null,
          image: (rest.image as string) || null,
          emailVerified: null,
        },
      });
    },
    // No-op session methods — JWT strategy handles sessions, but
    // NextAuth validates these methods exist on the adapter.
    createSession: () => Promise.resolve(null as never),
    deleteSession: () => Promise.resolve(null as never),
    updateSession: () => Promise.resolve(null as never),
    getSessionAndUser: () => Promise.resolve(null),
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const bcrypt = await import("bcryptjs");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // Block sign-in if email not verified
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: check if email is verified
      if (account?.provider === "google" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser && !dbUser.emailVerified) {
          // Generate and send verification code
          await prisma.verificationCode.deleteMany({ where: { email: user.email } });
          const code = generateVerificationCode();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
          await prisma.verificationCode.create({
            data: { email: user.email, code, expiresAt },
          });

          try {
            await sendVerificationCode(user.email, code);
          } catch {
            // If email fails, still redirect to verify page
          }

          // Redirect to verification page (blocks sign-in)
          return `/auth/verify?email=${encodeURIComponent(user.email)}`;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
