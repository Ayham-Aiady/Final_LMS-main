import { Router } from "express";
import jwt from 'jsonwebtoken';
const { JsonWebTokenError } = jwt;
import UserModel from "../models/userModel.js";
import passport from "../config/passport.js";
import AuthController from "../controllers/authController.js";
import { OAuthController } from "../controllers/oAuthController.js";
import { authenticate } from "../middleware/auth.js";
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
const router = Router();

// Regular auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.put("/change-password", authenticate, AuthController.changePassword);
router.post("/set-password", authenticate, AuthController.setPassword);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

// Google OAuth routes
console.log(">> FRONTEND_URL:", process.env.FRONTEND_URL);

router.get(
  "/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: 'select_account'
  })
);
router.get(
  "/google/register",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: 'consent select_account'
  })
);


// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//      failureRedirect: "/login",
//       session: false }),
//   (req, res) => {
// res.json({ success: true, token });
//   }
// );
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user;

      // Include all necessary info in token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar || null,
        provider: user.oauth_provider
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Set secure cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // ✅ Final step: Redirect to frontend
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);


// Link Google account (for existing users)
router.post(
  "/link-google",
  authenticate,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

export default router;