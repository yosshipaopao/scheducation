import {SvelteKitAuth} from "@auth/sveltekit"
import Google from "@auth/core/providers/google"
import type {Handle} from "@sveltejs/kit";

export const handle = SvelteKitAuth(async (event) => {
    return {
        providers: [Google({
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
            clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },

        })],
        pages:{
            signIn: "/signin",
        },
        callbacks: {
            async session({session}) {
                return session
            }
            ,
            async signIn({account, profile}) {
                if (account?.provider === "google") {
                    return profile?.email_verified && profile.email?.endsWith("@gmail.com")
                }
                return true // Do different verification for other providers that don't have `email_verified`
            },
        },
        secret: import.meta.env.VITE_SECRET as string,
        trustHost: true
    }
}) satisfies Handle;