import * as path from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync } from 'fastify'
import { fileURLToPath } from 'node:url'
import basicAuth from '@fastify/basic-auth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!
  fastify.addHook("onRequest", (request, reply, done) => {
    if (request.method !== "GET") {
      //* return notFound instead of methodNotAllowed
      return reply.notFound();
    }
    done();
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: opts,
    forceESM: true
  })

  // Register basic auth plugin and apply it to all routes
  fastify.register(basicAuth, {
    validate: async (username, password, req, reply) => {
      if (username !== process.env.API_USER || password !== process.env.API_PWD) {
        return new Error('Invalid credentials')
      }
    },
    authenticate: { realm: 'api-urjaamapakaha' }
  })

  // Apply basic auth to all routes after they are registered
  fastify.after(() => {
    fastify.addHook('onRequest', fastify.basicAuth)
  })

  fastify.setNotFoundHandler((_req, reply) => {
    return reply.notFound();
  });
}

export default app
export { app, options }
