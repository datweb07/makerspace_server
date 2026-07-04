import { getPool } from "./db/pool";

export class UserModel {
  private schema = "people";
  private tableName = "users";

  async findUserByUsername(username: string, lang: string = "vi") {
    const query = `SELECT * FROM ${this.schema}.${this.tableName} WHERE username = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [username]);
    return result.rows[0];
  }

  async findUserById(id: string, lang: string = "vi") {
    const query = `SELECT * FROM ${this.schema}.${this.tableName} WHERE id = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [id]);
    return result.rows[0];
  }

  // Helper method for initialization (seeds admin user)
  async createAdminUser(hashedPassword: string, lang: string = "vi") {
    const query = `
      INSERT INTO ${this.schema}.${this.tableName} (username, password, role, status)
      VALUES ($1, $2, 'admin', 'active')
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `;
    const result = await getPool(lang).query(query, ['admin', hashedPassword]);
    return result.rows[0];
  }
}
