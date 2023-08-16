import {SvelteKitAuth} from "@auth/sveltekit"
import Google from "@auth/core/providers/google"
import type {Handle} from "@sveltejs/kit";
import {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET, SECRET} from "$env/static/private";

export const handle = SvelteKitAuth(async () => {
    return {
        providers: [Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
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
        secret: SECRET,
        trustHost: true
    }
}) satisfies Handle;