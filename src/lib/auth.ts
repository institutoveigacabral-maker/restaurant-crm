import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDefaultTenantForUser } from "@/lib/tenant";

declare module "next-auth" {
  interface User {
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}

// JWT type extended via next-auth User augmentation above
// tenantId/tenantSlug/tenantName flow through jwt() and session() callbacks

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.tenantName = user.tenantName;
      }
      // Tenant switch via useSession().update({ tenantId, tenantSlug, tenantName, role })
      if (trigger === "update" && updateData) {
        if (updateData.tenantId) token.tenantId = updateData.tenantId;
        if (updateData.tenantSlug) token.tenantSlug = updateData.tenantSlug;
        if (updateData.tenantName) token.tenantName = updateData.tenantName;
        if (updateData.role) token.role = updateData.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.role = token.role;
        u.tenantId = token.tenantId;
        u.tenantSlug = token.tenantSlug;
        u.tenantName = token.tenantName;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = request.nextUrl.pathname.startsWith("/login");
      const isOnRegister = request.nextUrl.pathname.startsWith("/register");
      const isApi = request.nextUrl.pathname.startsWith("/api/auth");

      if (isOnLogin || isOnRegister || isApi) return true;
      if (!isLoggedIn) return false;
      return true;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

        const user = result[0];
        if (!user || !user.password) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        // Resolve default tenant for user
        const tenant = await getDefaultTenantForUser(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: tenant?.role ?? user.role,
          tenantId: tenant?.tenantId,
          tenantSlug: tenant?.tenantSlug,
          tenantName: tenant?.tenantName,
        };
      },
    }),
  ],
});
