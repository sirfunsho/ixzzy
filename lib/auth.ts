import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/account" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password || password.length > 128) return null;
        const db = createSupabaseAdminClient();
        const { data } = await db.from("app_users").select("id,email,name,password_hash,email_verified_at").eq("email", email).maybeSingle();
        if (!data?.password_hash || !data.email_verified_at || !(await bcrypt.compare(password, data.password_hash))) return null;
        return { id: data.id, email: data.email, name: data.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.trim().toLowerCase();
      const googleProfile = profile as { sub?: string; email_verified?: boolean; name?: string } | undefined;
      if (!email || !googleProfile?.sub || googleProfile.email_verified !== true) {
        console.error("Google account rejected: verified profile fields missing.", {
          hasEmail: Boolean(email), hasSubject: Boolean(googleProfile?.sub), emailVerified: googleProfile?.email_verified === true,
        });
        return false;
      }
      const db = createSupabaseAdminClient();
      const { data: existing, error: lookupError } = await db.from("app_users").select("id,google_sub").eq("email", email).maybeSingle();
      if (lookupError) {
        console.error("Google account lookup failed in app_users.", { code: lookupError.code, message: lookupError.message });
        return false;
      }
      if (existing?.google_sub && existing.google_sub !== googleProfile.sub) {
        console.error("Google account rejected: this email is linked to a different Google account.");
        return false;
      }
      const { data, error } = await db.from("app_users").upsert({
        id: existing?.id,
        email,
        name: user.name ?? googleProfile.name ?? email,
        google_sub: googleProfile.sub,
        email_verified_at: new Date().toISOString(),
      }, { onConflict: "email" }).select("id").single();
      if (error || !data) {
        console.error("Google account could not be saved in app_users.", { code: error?.code, message: error?.message });
        return false;
      }
      user.id = data.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
