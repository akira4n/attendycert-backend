const adminService = require('../services/admin.service');

const login = async (req, res, next) => {
  try {
    const { admin, token } = await adminService.loginAdmin(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
