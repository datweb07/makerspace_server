import { getPool } from "./db/pool";

export class AccountModel {
  async findMemberByEmail(email: string, lang: string = "vi") {
    const query = `SELECT * FROM accounts.members WHERE username = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [email]);
    return result.rows[0];
  }

  async findGuestByUsername(username: string, lang: string = "vi") {
    const query = `SELECT * FROM accounts.guests WHERE username = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [username]);
    return result.rows[0];
  }

  async insertGuest(username: string, passwordHash: string, lang: string = "vi") {
    const query = `
      INSERT INTO accounts.guests (username, password, role, auth_provider)
      VALUES ($1, $2, 'guest', 'password')
      RETURNING *;
    `;
    const result = await getPool(lang).query(query, [username, passwordHash]);
    return result.rows[0];
  }

  async updateGuestProfile(username: string, fullname: string, phone: string, lang: string = "vi") {
    const query = `
      UPDATE accounts.guests
      SET fullname = $2, phone = $3
      WHERE username = $1
      RETURNING *;
    `;
    const result = await getPool(lang).query(query, [username, fullname, phone]);
    return result.rows[0];
  }
}
