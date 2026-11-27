// Descarga el contrato OpenAPI desde la API y lo guarda (formateado) en openapi/simaveh.json.
// Uso: npm run api:sync   (URL configurable con OPENAPI_URL)
import { writeFile } from 'node:fs/promises';
import https from 'node:https';
import http from 'node:http';

const url = new URL(process.env.OPENAPI_URL ?? 'https://localhost:44340/openapi.json');
const output = new URL('../openapi/simaveh.json', import.meta.url);
// El certificado de desarrollo de ASP.NET es autofirmado: solo se omite la validacion en localhost.
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);

const body = await new Promise((resolve, reject) => {
  const client = url.protocol === 'https:' ? https : http;
  client
    .get(url, { rejectUnauthorized: !isLocal }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`GET ${url} respondio ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    })
    .on('error', reject);
});

const spec = JSON.parse(body);
await writeFile(output, JSON.stringify(spec, null, 2) + '\n', 'utf8');
console.log(`OpenAPI ${spec.info?.title} v${spec.info?.version} guardado en openapi/simaveh.json`);
