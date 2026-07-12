const adminService = require("../services/admin.service");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required!");
      error.status = 400;
      throw error;
    }

    const { admin, token } = await adminService.loginAdmin(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token: token,
        admin: { id: admin.id, name: admin.name, email: admin.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
