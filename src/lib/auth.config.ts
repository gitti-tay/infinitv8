import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Store last auth error for debugging via /api/health
let _lastAuthError: string | null = null;
export function getLastAuthError() {
  return _lastAuthError;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  debug: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  logger: {
    error(error) {
      const msg = error instanceof Error
        ? `${error.name}: ${error.message} | cause: ${error.cause ? JSON.stringify(error.cause) : "none"}`
        : JSON.stringify(error);
      _lastAuthError = msg;
      console.error("[auth]", msg);
    },
    warn(code) {
      console.warn("[auth-warn]", code);
    },
    debug(message, metadata) {
      console.log("[auth-debug]", message, metadata);
    },
  },
  pages: { signIn: "/auth/signin" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
