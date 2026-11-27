import { defineConfig } from 'orval';
import { transformSimavehSpec } from './openapi/transform.ts';

export default defineConfig({
  simaveh: {
    input: {
      target: './openapi/simaveh.json',
      override: { transformer: transformSimavehSpec },
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      formatter: 'prettier',
      override: {
        mutator: { path: 'src/api/http.ts', name: 'httpClient' },
      },
    },
  },
});
