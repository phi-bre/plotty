import preprocess from 'svelte-preprocess';
import sequence from 'svelte-sequential-preprocessor';
import vercel from '@sveltejs/adapter-vercel';
import { preprocessThrelte } from '@threlte/preprocess';

/** @type {import("@sveltejs/kit").Config} */
export default {
  preprocess: [
    sequence([
      preprocess({
        postcss: true,
      }),
      preprocessThrelte(),
    ]),
  ],
  kit: {
    adapter: vercel(),
  },
};
