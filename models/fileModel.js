const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class FileModel {
  async createFile(data) {
    return await prisma.file.create({
      data: {
        filename: data.filename,
        size: data.size,
        path: data.path,
        type: data.type,
        userId: data.userId,
      },
    });
  }

  async getFileById(id) {
    return await prisma.file.findUnique({
      where: { id },
    });
  }

  async getFileByName(filename) {
    return await prisma.file.findFirst({
      where: { filename },
    });
  }

  async getFilesByUser(userId) {
    return await prisma.file.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async getAllFiles() {
    return await prisma.file.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async updateFile(id, data) {
    return await prisma.file.update({
      where: { id },
      data: {
        ...(data.filename && { filename: data.filename }),
        ...(data.size !== undefined && data.size !== null && { size: data.size }),
        ...(data.path && { path: data.path }),
        ...(data.type && { type: data.type }),
        ...(data.userId && { userId: data.userId }),
      },
    });
  }

  async deleteFile(id) {
    return await prisma.file.delete({
      where: { id },
    });
  }


}

module.exports = new FileModel(); 
