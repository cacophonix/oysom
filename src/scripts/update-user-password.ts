import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function updateUserPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required")
  }

  const userService = container.resolve(Modules.USER)
  const authService = container.resolve(Modules.AUTH)
  const provider = "emailpass"

  const existingUsers = await userService.listUsers({ email })

  if (!existingUsers.length) {
    const user = await userService.createUsers({ email })
    const { authIdentity, error } = await authService.register(provider, {
      body: { email, password },
    })

    if (error || !authIdentity) {
      throw new Error(error ?? "Failed to create admin user")
    }

    await authService.updateAuthIdentities({
      id: authIdentity.id,
      app_metadata: {
        user_id: user.id,
      },
    })

    logger.info(`Created admin user: ${email}`)
    return
  }

  const result = await authService.updateProvider(provider, {
    entity_id: email,
    password,
  })

  if (!result.success) {
    throw new Error(result.error ?? "Failed to update admin password")
  }

  logger.info(`Updated password for: ${email}`)
}
