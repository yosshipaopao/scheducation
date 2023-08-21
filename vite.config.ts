import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {SvelteKitPWA} from "@vite-pwa/sveltekit";

export default defineConfig({
    plugins: [sveltekit(),SvelteKitPWA({
        strategies:"injectManifest",
        srcDir: 'src',
        filename: 'sw.js',
        devOptions: {
            enabled: true
        }
    })],
    // see https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#generate-custom-service-worker
    define: {
        'process.env.NODE_ENV': process.env.NODE_ENV === 'production'
            ? '"production"'
            : '"development"'
    }
});
