const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deactivateUser
  activateUser
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const roleMiddleware = require("../middlewares/role.middleware");

const ROLES = require("../constants/roles");

/*
|--------------------------------------------------------------------------
| Admin Only Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  getSingleUser
);

router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  updateUserRole
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  deactivateUser
);

module.exports = router;
