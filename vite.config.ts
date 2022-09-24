// @ts-ignore
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['@fortawesome/free-brands-svg-icons', 'three', 'troika-three-text'],
  },
};
