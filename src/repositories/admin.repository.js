const prisma = require("../config/prisma");

const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({
    where: { email },
  });
};

module.exports = {
  findAdminByEmail,
};
