import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmails = (process.env.AUTHORIZED_ORGANIZER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/organizar" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (allowedEmails.length === 0) return true;
      return allowedEmails.includes(user.email.toLowerCase());
    },
  },
  session: { strategy: "jwt" },
});
