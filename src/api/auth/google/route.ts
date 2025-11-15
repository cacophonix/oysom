import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

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
    // Initiate Google OAuth
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res)
  } catch (err) {
    console.error("Google OAuth initiation error:", err)
    const frontendUrl = process.env.STORE_CORS?.split(",")[0] || "http://localhost:8000"
    return res.redirect(`${frontendUrl}/account?auth=error&message=${encodeURIComponent("Failed to initiate authentication")}`)
  }
}