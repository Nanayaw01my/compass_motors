import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import Customer from "@/lib/db/models/Customer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await connectDB();

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Try admin first (email format)
        const admin = await Admin.findOne({ email: username.toLowerCase() });
        if (admin) {
          const isValid = await bcrypt.compare(password, admin.password);
          if (!isValid) return null;
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: "admin",
          };
        }

        // Try customer (phone number as username)
        const customer = await Customer.findOne({ username });
        if (!customer) return null;
        if (customer.status === "suspended") throw new Error("Account suspended");
        const isValid = await bcrypt.compare(password, customer.password);
        if (!isValid) return null;
        return {
          id: customer._id.toString(),
          name: customer.fullName,
          email: customer.email || "",
          role: "customer",
          customerId: customer.customerId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.customerId = (user as any).customerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).customerId = token.customerId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
