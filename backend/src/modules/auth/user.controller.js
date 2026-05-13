/**
 * User Management Controller - Admin operations only
 */

const { z } = require('zod');
const User = require('./user.model');

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'viewer']),
});

// Admin: Get all users (with pagination support)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.pagination || {};
    
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent deleting self
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_SELF',
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
};
