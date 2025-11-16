const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserModel {
    async createUser(data) {
        return await prisma.user.create({
            data: {
              username: data.username,
              email: data.email,
              password: data.password, // hash bcrypt
              role: data.role ?? "USER",
            },
          });
    }

    async updateUser(id, data) {
        return await prisma.user.update({
            where: { id },
            data: {
              ...(data.username && { username: data.username }),
              ...(data.email && { email: data.email }),
              ...(data.password && { password: data.password }), // hash bcrypt
            },
          });
    }

    async updateUserRole(id, newrole) {
        return await prisma.user.update({
            where: { id: id },
            data: { role: newrole },
          })
    }

    async deleteUser(id) {
      return await prisma.user.delete({
        where: { id: id },
      })
    }

    async getUserByEmail(email) {
      return await prisma.user.findUnique({
        where: { email: email },
      })
    }

    async getUserByUsername(username) {
        return await prisma.user.findUnique({
            where: { username: username },
          })
    }

    async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id: id },
          })
    }
}


module.exports = new UserModel(); 
