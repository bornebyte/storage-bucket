import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    theme: {
        logo: "https://next-auth.js.org/img/logo/logo-sm.png",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password", placeholder: "admin" },
            },
            async authorize(credentials) {
                const adminUsername = process.env.ADMIN_USERNAME || "admin";
                const adminPassword = process.env.ADMIN_PASSWORD || "admin";

                if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
                    return { id: "1", name: "Admin User", email: "admin@example.com" }
                }
                return null
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
        async session({ session, token }) {
            return session
        },
        async jwt({ token, user }) {
            return token
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
}
