const { PrismaClient } = require('@prisma/client');

/**
 * Database configuration and Prisma client setup
 */
class Database {
  constructor() {
    this.prisma = null;
  }

  /**
   * Initialize Prisma client
   * @returns {PrismaClient} Prisma client instance
   */
  connect() {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return this.prisma;
  }

  /**
   * Get Prisma client instance
   * @returns {PrismaClient} Prisma client instance
   */
  getClient() {
    if (!this.prisma) {
      return this.connect();
    }
    return this.prisma;
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const client = this.getClient();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const database = new Database();
module.exports = database; 