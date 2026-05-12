const User = require("../models/user.model");
const roles = require("../constants/roles");

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
| Admin only
*/

const getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Get Single User
|--------------------------------------------------------------------------
| Admin only
*/

const getSingleUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Update User Role
|--------------------------------------------------------------------------
| Admin only
*/

const updateUserRole = async (req, res) => {
  try {

    const { role } = req.body;

    // Validate role
    const validRoles = Object.values(roles);

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Deactivate User
|--------------------------------------------------------------------------
| Admin only
*/

const deactivateUser = async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      {
        new: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Activate User
|--------------------------------------------------------------------------
| Optional but useful
*/

const activateUser = async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      {
        new: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deactivateUser,
  activateUser
};
