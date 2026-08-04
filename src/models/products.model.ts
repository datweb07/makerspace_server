import { getPool } from "./db/pool";
import type { CreateProductInput, UpdateProductInput } from "../schemaValidation/products.schema";

class ProductsModel {
  async list(lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `
        SELECT i.*, c.name as category_name
        FROM products.items i
        LEFT JOIN products.categories c ON i.category_id = c.id
        ORDER BY i.created_at DESC
      `,
    });
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category_name || "Khác",
      material: row.specs?.material || "",
      price: (row.price === null || Number(row.price) === 0) ? "Liên hệ" : Number(row.price).toLocaleString('vi-VN') + 'đ',
      description: row.content,
      image: row.cover_image,
      images: row.specs?.images || [],
      draft: row.draft,
    }));
  }

  async listCategories(lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `SELECT id, name, slug, draft FROM products.categories ORDER BY created_at DESC`,
    });
    return res.rows;
  }

  async addCategory(input: { name: string; slug?: string }, lang: string = "vi") {
    let slug = input.slug;
    if (!slug) {
      slug = input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    const res = await getPool(lang).query({
      text: `INSERT INTO products.categories (name, slug) VALUES ($1, $2) RETURNING name`,
      values: [input.name, slug],
    });
    return res.rows[0]?.name;
  }

  async updateCategory(id: number, input: { name: string; slug?: string }, lang: string = "vi") {
    let slug = input.slug;
    if (!slug) {
      slug = input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    const res = await getPool(lang).query({
      text: `UPDATE products.categories SET name = $1, slug = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id`,
      values: [input.name, slug, id],
    });
    return res.rows.length > 0;
  }

  async deleteCategory(id: number, lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `DELETE FROM products.categories WHERE id = $1 RETURNING id`,
      values: [id],
    });
    return res.rows.length > 0;
  }

  async toggleCategoryDraft(id: number, draft: boolean, lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `UPDATE products.categories SET draft = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      values: [draft, id],
    });
    return res.rows.length > 0;
  }

  async findById(id: number, lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `
        SELECT i.*, c.name as category_name
        FROM products.items i
        LEFT JOIN products.categories c ON i.category_id = c.id
        WHERE i.id = $1
      `,
      values: [id],
    });
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      category: row.category_name || "Khác",
      material: row.specs?.material || "",
      price: (row.price === null || Number(row.price) === 0) ? "Liên hệ" : Number(row.price).toLocaleString('vi-VN') + 'đ',
      description: row.content,
      image: row.cover_image,
      images: row.specs?.images || [],
      draft: row.draft,
    };
  }

  async create(input: CreateProductInput, lang: string = "vi") {
    let category_id = null;
    if (input.category) {
      const catRes = await getPool(lang).query({
        text: `SELECT id FROM products.categories WHERE name = $1`,
        values: [input.category],
      });
      if (catRes.rows.length > 0) {
        category_id = catRes.rows[0].id;
      }
    }

    let slug = input.slug;
    if (!slug) {
      slug = input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    let numericPrice = 0;
    try {
      const p = parseFloat(input.price.replace(/[^\d.]/g, ""));
      if (!isNaN(p)) numericPrice = p;
    } catch (e) { }

    const res = await getPool(lang).query({
      text: `
        INSERT INTO products.items (category_id, name, slug, cover_image, description, content, price, specs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `,
      values: [
        category_id,
        input.name,
        slug + '-' + Date.now().toString().slice(-4),
        input.image,
        null,
        input.description,
        numericPrice,
        JSON.stringify({ material: input.material, images: input.images || [] }),
      ],
    });
    return this.findById(res.rows[0].id, lang);
  }

  async update(id: number, input: UpdateProductInput, lang: string = "vi") {
    let category_id = null;
    if (input.category) {
      const catRes = await getPool(lang).query({
        text: `SELECT id FROM products.categories WHERE name = $1`,
        values: [input.category],
      });
      if (catRes.rows.length > 0) {
        category_id = catRes.rows[0].id;
      }
    }

    let numericPrice = 0;
    try {
      const p = parseFloat(input.price.replace(/[^\d.]/g, ""));
      if (!isNaN(p)) numericPrice = p;
    } catch (e) { }

    await getPool(lang).query({
      text: `
        UPDATE products.items
        SET category_id = $1, name = $2, cover_image = $3, content = $4, price = $5, specs = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
      `,
      values: [
        category_id,
        input.name,
        input.image,
        input.description,
        numericPrice,
        JSON.stringify({ material: input.material, images: input.images || [] }),
        id
      ],
    });
    return this.findById(id, lang);
  }

  async delete(id: number, lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `DELETE FROM products.items WHERE id = $1 RETURNING id`,
      values: [id],
    });
    return res.rows.length > 0;
  }

  async toggleItemDraft(id: number, draft: boolean, lang: string = "vi") {
    const res = await getPool(lang).query({
      text: `UPDATE products.items SET draft = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      values: [draft, id],
    });
    return res.rows.length > 0;
  }
}

export const productsModel = new ProductsModel();
