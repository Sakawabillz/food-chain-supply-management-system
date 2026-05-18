const mongoose = require("mongoose");
const User = require("../models/user.model");
const roles = require("../constants/roles");
const logAction = require("../utils/logAction");

const validRoles = Object.values(roles);
const publicUserFields = "-password";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureValidUserId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, "Invalid user id");
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(publicUserFields).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return next(error);
  }
};

const getSingleUser = async (req, res, next) => {
  try {
    ensureValidUserId(req.params.id);

    const user = await User.findById(req.params.id).select(publicUserFields);

    if (!user) {
      throw createError(404, "User not found");
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    ensureValidUserId(req.params.id);

    const role = String(req.body.role || "").toUpperCase();

    if (!validRoles.includes(role)) {
      throw createError(400, "Invalid role provided");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select(publicUserFields);

    if (!user) {
      throw createError(404, "User not found");
    }

    await logAction(
      req.user.id,
      "UPDATE_USER_ROLE",
      "User",
      user._id,
      `Updated user role to ${role}`
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    ensureValidUserId(req.params.id);

    if (String(req.user.id) === String(req.params.id)) {
      throw createError(400, "You cannot deactivate your own account");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      {
        new: true
      }
    ).select(publicUserFields);

    if (!user) {
      throw createError(404, "User not found");
    }

    await logAction(
      req.user.id,
      "DEACTIVATE_USER",
      "User",
      user._id,
      "Deactivated user account"
    );

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    ensureValidUserId(req.params.id);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      {
        new: true
      }
    ).select(publicUserFields);

    if (!user) {
      throw createError(404, "User not found");
    }

    await logAction(
      req.user.id,
      "ACTIVATE_USER",
      "User",
      user._id,
      "Activated user account"
    );

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deactivateUser,
  activateUser
};
