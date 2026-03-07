import type { NextAuthConfig } from "next-auth";

// Explicit OAuth2 Google provider — avoids OIDC discovery that fails
// with NextAuth v5 beta.30 + Next.js 16 (see nextauthjs/next-auth#13388).
const GoogleOAuth = {
  id: "google",
  name: "Google",
  type: "oauth" as const,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      scope: "openid email profile",
      response_type: "code",
      prompt: "consent",
      access_type: "offline",
    },
  },
  token: { url: "https://oauth2.googleapis.com/token" },
  userinfo: { url: "https://openidconnect.googleapis.com/v1/userinfo" },
  profile(profile: { sub: string; name: string; email: string; picture: string }) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: { signIn: "/auth/signin" },
  providers: [GoogleOAuth],
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
