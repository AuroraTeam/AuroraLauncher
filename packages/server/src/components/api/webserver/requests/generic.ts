import { FastifyInstance } from "fastify";
import fastifyStatic from '@fastify/static';
import { StorageHelper } from "@root/utils";

interface Options {
  disableListing: boolean;
  hideListing: boolean;
}

async function genericRoutes(fastify: FastifyInstance, opts: Options) {
  if (!opts.disableListing)
  fastify.register(fastifyStatic, {
    root: StorageHelper.gameFilesDir,
    prefix: '/files/',
    index: false,
    list:{
      format: 'html',
      render: (dirs, files) => {
        if (!opts.hideListing)
        return `
        <html><head><style>*{font-family:monospace;font-size:14px}</style></head><body>
        <ul>
          ${dirs.map(dir => `<li><a href="${dir.href}">${dir.name}</a></li>`).join('\n  ')}
        </ul>
        <ul>
          ${files.map(file => `<li><a href="${file.href}" target="_blank">${file.name}</a></li>`).join('\n  ')}
        </ul>
        </body></html>
        `
      }
    }
  })

  fastify.get('/', async (req, reply) => {
    reply.header("X-Authlib-Injector-API-Location", "/authlib");
    reply.redirect('/files/');
  });
}

export default genericRoutes;