import vercel from '@sveltejs/adapter-vercel';

export default {
  adapter: vercel(),
  kit: {
    target: '#svelte',
    ssr: false,
  },
};
