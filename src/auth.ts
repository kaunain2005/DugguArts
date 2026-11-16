
import NextAuth from "next-auth";
import { authConfig, isAdminEmail, adminEmails } from "./auth.config";
import { nodeAuthLogger } from "@/lib/logging/node";

nodeAuthLogger.info("Auth.js v5 initialized", {
  hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
  hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  adminEmailsCount: adminEmails.length,
  nodeEnv: process.env.NODE_ENV,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      nodeAuthLogger.info("Authentication attempt", {
        userEmail: user.email,
        provider: account?.provider,
        isAdmin: isAdminEmail(user.email ?? ""),
      });

      // One login for all users.
      return !!user.email;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }

      if (token.email) {
        token.isAdmin = isAdminEmail(token.email as string);
      } else {
        token.isAdmin = false;
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
      }

      nodeAuthLogger.debug("JWT callback completed", {
        userEmail: token.email,
        isAdmin: token.isAdmin,
        hasAccount: !!account,
      });

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
      nodeAuthLogger.debug("Authentication redirect", {
        url,
        baseUrl,
      });

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        if (new URL(url).origin === new URL(baseUrl).origin) {
          return url;
        }
      } catch {
        // Use safe default.
      }

      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      nodeAuthLogger.info("User signed in", {
        userEmail: user.email,
        userId: user.id,
        provider: account?.provider,
        isAdmin: isAdminEmail(user.email ?? ""),
        isNewUser,
      });
    },

    async signOut() {
      nodeAuthLogger.info("User signed out");
    },

    async createUser({ user }) {
      nodeAuthLogger.info("User account created", {
        userEmail: user.email,
        userId: user.id,
      });
    },

    async updateUser({ user }) {
      nodeAuthLogger.info("User account updated", {
        userEmail: user.email,
      });
    },

    async linkAccount({ user, account }) {
      nodeAuthLogger.info("Account linked", {
        userEmail: user.email,
        provider: account.provider,
      });
    },
  },
});
