import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const res = await fetch(`${process.env.HOST}/api/users/login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();
        // If no error and we have user data, return it
        if (res.ok && !user.error) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user && user._id) {
        token.id = user._id;
        token.accessToken = user.token;
        token.name = user.fullname;
      }
      return token;
    },
  },
  pages: {
    signIn: "/arenq/pages/index.js",
  },
};
export default NextAuth(authOptions);
