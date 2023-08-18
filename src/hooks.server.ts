import {SvelteKitAuth} from "@auth/sveltekit"
import Google from "@auth/core/providers/google"
import type {Handle} from "@sveltejs/kit";
import {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET, SECRET} from "$env/static/private";
import {MyAdapter} from "$lib/server/authAdapter";
import {db} from "$lib/server/DB";

export const handle = SvelteKitAuth(async () => {
    return {
        adapter: MyAdapter(db),
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
            newUser: "/setup",
        },
        callbacks: {
            async session({session,user }) {
                if(user.class&&session.user)session.user.class=user.class
                if(user.id&&session.user)session.user.id=user.id
                return session
            },
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