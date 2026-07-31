import { getPool } from "./db/pool";

export class AccountModel {
  async findMemberByEmail(email: string, lang: string = "vi") {
    const query = `SELECT * FROM people.users WHERE username = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [email]);
    return result.rows[0];
  }

  async findGuestByUsername(username: string, lang: string = "vi") {
    const query = `SELECT * FROM people.users WHERE username = $1 LIMIT 1;`;
    const result = await getPool(lang).query(query, [username]);
    return result.rows[0];
  }

  async insertGuest(username: string, passwordHash: string, lang: string = "vi") {
    const query = `
      INSERT INTO people.users (username, password, role, status)
      VALUES ($1, $2, 'guest', 'active')
      RETURNING *;
    `;
    const result = await getPool(lang).query(query, [username, passwordHash]);
    return result.rows[0];
  }
}
