import express from "express";
import {
  getAllRides,
  getLoggedInUserData,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const userRouter = express.Router();

// Redirect to new OTP endpoints
userRouter.post("/registration", (req, res) => {
  res.redirect(307, "/api/v1/otp/generate/phone");
});

userRouter.post("/verify-otp", (req, res) => {
  res.redirect(307, "/api/v1/otp/verify/user/phone");
});

userRouter.post("/email-otp-request", (req, res) => {
  res.redirect(307, "/api/v1/otp/generate/email");
});

userRouter.put("/email-otp-verify", (req, res) => {
  res.redirect(307, "/api/v1/otp/verify/email");
});

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

userRouter.get("/get-rides", isAuthenticated, getAllRides);

export default userRouter;
