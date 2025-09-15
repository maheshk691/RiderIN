import express from "express";
import {
  getAllRides,
  getDriversById,
  getLoggedInDriverData,
  newRide,
  updateDriverStatus,
  updatingRideStatus,
} from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

// Redirect to new OTP endpoints
driverRouter.post("/send-otp", (req, res) => {
  res.redirect(307, "/api/v1/otp/generate/phone");
});

driverRouter.post("/login", (req, res) => {
  res.redirect(307, "/api/v1/otp/verify/driver/phone/login");
});

driverRouter.post("/verify-otp", (req, res) => {
  res.redirect(307, "/api/v1/otp/verify/driver/phone/registration");
});

driverRouter.post("/registration-driver", (req, res) => {
  res.redirect(307, "/api/v1/otp/verify/email");
});

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);

driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
  updatingRideStatus
);

driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);

export default driverRouter;
