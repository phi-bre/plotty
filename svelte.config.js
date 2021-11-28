import vercel from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: vercel(),
    target: '#svelte',
    ssr: false,
    vite: {
      // optimizeDeps: {
      //   include: ['carbon-components-svelte', 'clipboard-copy'],
      // },
    },
  },
};
