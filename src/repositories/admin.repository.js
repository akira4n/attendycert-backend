const prisma = require("../config/prisma");

const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({
    where: { email: email },
  });
};

module.exports = {
  findAdminByEmail,
};
