const express = require("express");
const router = express.Router();

const {
  createShipment,
  getAllShipments,
  getShipmentById,
  markAsDelivered,
} = require("../controllers/shipment.controller");

const { validateCreateShipment } = require("../validations/shipment.validation");

// expecting this from g1 but they ca change it if they have something different. 
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// making sure only distributor can create shipment, and only authenticated users can view shipments (with role-based filtering in service)
router.post(
  "/",
  protect,
  authorizeRoles("DISTRIBUTOR"),
  validateCreateShipment,
  createShipment
);

// allowing All authenticated roles can view shipment based on their role.
router.get("/", protect, authorizeRoles("ADMIN", "DISTRIBUTOR", "FARMER", "INSPECTOR"), getAllShipments);

// get a Single shipment
router.get("/:id", protect, authorizeRoles("ADMIN", "DISTRIBUTOR", "FARMER", "INSPECTOR"), getShipmentById);

// updating shipment status when delivered — distributor role only   
router.patch(
  "/:id/deliver",
  protect,
  authorizeRoles("DISTRIBUTOR"),
  markAsDelivered
);

module.exports = router;
