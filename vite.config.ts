import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {SvelteKitPWA} from "@vite-pwa/sveltekit";

export default defineConfig({
    plugins: [sveltekit()],
    // see https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#generate-custom-service-worker
});
