
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    normalizedEmail.length > 0 &&
    adminEmails.length > 0 &&
    adminEmails.includes(normalizedEmail)
  );
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Customers and admins use the same Google login.
      return !!user.email;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.isAdmin = isAdminEmail(user.email ?? "");
      }

      // Recalculate the role from the email on every JWT callback.
      // This also allows an admin allowlist change to take effect
      // when the session is refreshed.
      if (token.email) {
        token.isAdmin = isAdminEmail(token.email);
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.email = (token.email as string) ?? "";
        // Use type assertion since User type doesn't include isAdmin by default
        (session.user as { isAdmin?: boolean }).isAdmin = token.email
          ? isAdminEmail(token.email as string)
          : false;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        if (new URL(url).origin === new URL(baseUrl).origin) {
          return url;
        }
      } catch {
        // Fall through to the safe default.
      }

      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
