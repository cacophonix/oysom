import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Modules } from "@medusajs/framework/utils"

// Configure Google Strategy
const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:9000/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile)
      }
    )
  )
}

// Initialize strategy
configureGoogleStrategy()

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    passport.authenticate("google", { session: false }, async (err: any, profile: any) => {
      if (err || !profile) {
        const frontendUrl = process.env.STORE_CORS?.split(",")[0] || (process.env.NODE_ENV === "production" ? "https://www.oysom.com" : "http://localhost:3001")
        return res.redirect(`${frontendUrl}/account?auth=error&message=${encodeURIComponent(err?.message || "Authentication failed")}`)
      }

      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value
        const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "User"
        const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || ""
        
        if (!email) {
          const frontendUrl = process.env.STORE_CORS?.split(",")[0] || (process.env.NODE_ENV === "production" ? "https://www.oysom.com" : "http://localhost:3001")
          return res.redirect(`${frontendUrl}/account?auth=error&message=${encodeURIComponent("No email provided by Google")}`)
        }

        // Use Medusa's query to check if customer exists
        const query: any = req.scope.resolve("query")
        const { data: customers } = await query.graph({
          entity: "customer",
          fields: ["id", "email", "first_name", "last_name", "has_account"],
          filters: { email }
        })

        let customerId
        let isNewCustomer = false
        let authToken
        
        if (customers && customers.length > 0) {
          // Customer exists
          customerId = customers[0].id
        } else {
          // Create new customer
          const customerModule: any = req.scope.resolve(Modules.CUSTOMER)
          const newCustomer = await customerModule.createCustomers({
            email,
            first_name: firstName,
            last_name: lastName,
            has_account: true,
          })
          customerId = newCustomer.id
          isNewCustomer = true
        }

        // Create auth identity if not exists
        try {
          const authModule: any = req.scope.resolve(Modules.AUTH)
          await authModule.createAuthIdentities({
            provider_identities: [{
              provider: "google",
              entity_id: customerId,
              provider_metadata: {
                google_id: profile.id,
                email: email,
              }
            }]
          })
        } catch (authIdentityError) {
          // Auth identity already exists, that's fine
          console.log("Auth identity may already exist")
        }

        // Generate JWT token for the customer
        const jwt = require("jsonwebtoken")
        authToken = jwt.sign(
          {
            actor_id: customerId,
            actor_type: "customer",
            app_metadata: {
              customer_id: customerId
            }
          },
          process.env.JWT_SECRET || "supersecret",
          { expiresIn: "30d" }
        )

        // Set auth cookie with the correct format Medusa expects
        const cookieOptions = "Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000" // 30 days
        res.setHeader("Set-Cookie", `_medusa_jwt=${authToken}; ${cookieOptions}`)

        // Redirect to frontend with success
        const frontendUrl = process.env.STORE_CORS?.split(",")[0] || (process.env.NODE_ENV === "production" ? "https://www.oysom.com" : "http://localhost:3001")
        return res.redirect(`${frontendUrl}/account?auth=google_success`)
      } catch (error: any) {
        console.error("Error in Google OAuth flow:", error)
        const frontendUrl = process.env.STORE_CORS?.split(",")[0] || (process.env.NODE_ENV === "production" ? "https://www.oysom.com" : "http://localhost:3001")
        return res.redirect(`${frontendUrl}/account?auth=error&message=${encodeURIComponent(error.message || "Failed to authenticate")}`)
      }
    })(req, res)
  } catch (err: any) {
    console.error("Google OAuth callback error:", err)
    const frontendUrl = process.env.STORE_CORS?.split(",")[0] || (process.env.NODE_ENV === "production" ? "https://www.oysom.com" : "http://localhost:3001")
    return res.redirect(`${frontendUrl}/account?auth=error&message=${encodeURIComponent("Authentication error")}`)
  }
}