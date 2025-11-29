import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
