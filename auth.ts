import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmails = (process.env.AUTHORIZED_ORGANIZER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "organizer",
        };
      },
    }),
  ],
  pages: {
    signIn: "/organizar",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (allowedEmails.length === 0) return true;
      return allowedEmails.includes(user.email.toLowerCase());
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
