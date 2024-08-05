import { prisma } from "./prisma"

export async function syncEnvironmentsFromDb() {
  const environments = await prisma.environment.findMany()
  
  environments.forEach((env) => {
    process.env[env.name] = env.value
  })
}

export async function upsertSingleEnvironment(name: string, value: string) {
  await prisma.environment.upsert({
    create: {
      name,
      value
    },
    update: {
      value
    },
    where: {
      name
    }
  })

  process.env[name] = value
}

export async function readEnvironments() {
  const environments = await prisma.environment.findMany()
  return environments
}