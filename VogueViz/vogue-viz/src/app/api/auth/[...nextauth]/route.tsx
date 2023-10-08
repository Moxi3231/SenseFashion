import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
const handler = NextAuth({
    secret:process.env.NEXTAUTH_URL,

    pages: {
        signIn: '/',
        signOut: '/',
        error: '/unauthorizedLogin',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
      
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const res = await fetch(process.env.SITE_PR_HST!.concat("/api/verifyAdminLogin"), {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                }).then(res => res.json());
                if (res.valid) {
                    console.log(res)
                    return res.user; 
                }
                return null
            }
        })
    ]
})

export { handler as GET, handler as POST }