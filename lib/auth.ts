import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import Customer from "@/lib/db/models/Customer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await connectDB();

        const role = credentials.role as string || "customer";

        if (role === "admin") {
          const admin = await Admin.findOne({ email: credentials.username });
          if (!admin) return null;
          const isValid = await bcrypt.compare(credentials.password as string, admin.password);
          if (!isValid) return null;
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: "admin",
          };
        } else {
          const customer = await Customer.findOne({ username: credentials.username });
          if (!customer) return null;
          if (customer.status === "suspended") throw new Error("Account suspended");
          const isValid = await bcrypt.compare(credentials.password as string, customer.password);
          if (!isValid) return null;
          return {
            id: customer._id.toString(),
            name: customer.fullName,
            email: customer.email || "",
            role: "customer",
            customerId: customer.customerId,
          };
        }
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
