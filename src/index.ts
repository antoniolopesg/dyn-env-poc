import Fastify from "fastify";
import { prisma } from "./lib/prisma";
import { readEnvironments, syncEnvironmentsFromDb, upsertSingleEnvironment } from "./environmentService";

const fastify = Fastify({
  logger: true,
});

type GetEnvironmentsQuery = {
  fromProcess: boolean
}

fastify.get('/environments', async (request, reply) => {
  try {
    const { fromProcess } = request.query as GetEnvironmentsQuery

    const environments = await readEnvironments()

    if(fromProcess) {
      const environmentMappedFromProcess = environments
        .map(env => ({ name: env.name, value: process.env[env.name] }))
      return environmentMappedFromProcess
    }

    return environments
  } catch(err){
    fastify.log.error(err)
    reply.status(500)
    return 'Internal Server Error'
  }
})

type UpdateEnvironmentRequest = {
  name: string
  value: string
}

fastify.put('/environments', async (request, reply) => {
  const { name, value } = request.body as UpdateEnvironmentRequest

  try {
    await upsertSingleEnvironment(name, value)
    return { msg: 'Update complete' }
  } catch(err){
    fastify.log.error(err)
    reply.status(500)
    return 'Internal Server Error'
  }
})


const start = async () => {
  try {
    await syncEnvironmentsFromDb()
    await fastify.listen({ port: 3000 })
  } catch (err) {
    await prisma.$disconnect()
    fastify.log.error(err)
    process.exit(1)
  }
}

start()