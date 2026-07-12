const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminRepo = require("../repositories/admin.repository");

const loginAdmin = async (email, password) => {
  const admin = await adminRepo.findAdminByEmail(email);
  if (!admin) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  return { admin, token };
};

module.exports = {
  loginAdmin,
};
