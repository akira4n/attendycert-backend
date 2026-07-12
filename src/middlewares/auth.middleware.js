const jwt = require("jsonwebtoken");

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error(
        "Access denied. Token not found or format is invalid.",
      );
      error.status = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error.status = 401;
      error.message = "Session expired.";
    }

    next(error);
  }
};

module.exports = { protectAdmin };
