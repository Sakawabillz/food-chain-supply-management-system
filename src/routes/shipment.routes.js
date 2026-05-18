const express = require("express");
const router = express.Router();

const {
  createShipment,
  getAllShipments,
  getShipmentById,
  markAsDelivered
} = require("../controllers/shipment.controller");

const {
  validateCreateShipment,
  validateShipmentId
} = require("../validations/shipment.validation");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const ROLES = require("../constants/roles");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.DISTRIBUTOR),
  validateCreateShipment,
  createShipment
);

router.get("/", authMiddleware, getAllShipments);

router.get("/:id", authMiddleware, validateShipmentId, getShipmentById);

router.patch(
  "/:id/deliver",
  authMiddleware,
  roleMiddleware(ROLES.DISTRIBUTOR),
  validateShipmentId,
  markAsDelivered
);

module.exports = router;
