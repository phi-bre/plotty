const vercel = require('@sveltejs/adapter-vercel');

export default {
  adapter: vercel(),
  kit: {
    target: '#svelte',
    ssr: false,
  },
};
