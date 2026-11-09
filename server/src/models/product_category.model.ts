import { pool } from "../config/db.js";

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date
}

export class ProductCategoryModel {
    // Create
    static async create(name: string, image: string): Promise<ProductCategory> {
        const query = `
      INSERT INTO product_category (name,image)
      VALUES ($1,$2)
      RETURNING *;
    `;

        const { rows } = await pool.query<ProductCategory>(query, [name, image]);

        return rows[0];
    }

    static async getAdminList(): Promise<ProductCategory[]> {
        return this.findAll("all");
    }

    // Get All
    static async findAll(status: 'active' | 'inactive' | 'all' | null = 'active'): Promise<ProductCategory[]> {

        console.log(status)
        let query = `
      SELECT *
      FROM product_category
      WHERE deleted_at IS NULL
    `;
        const values: string[] = [];

        if (status && status !== "all") {
            query += `AND status = $1`
            values.push(status);
        }

        query += ` ORDER BY id ASC`;
        const { rows } = await pool.query<ProductCategory>(query, values);

        return rows;
    }

    // Get By Id
    static async findById(id: number): Promise<ProductCategory | null> {
        const query = `
      SELECT *
      FROM product_category
      WHERE id = $1 AND  deleted_at IS NULL AND status = 'active';
    `;

        const { rows } = await pool.query<ProductCategory>(query, [id]);

        return rows[0] ?? null;
    }

    // Update
    static async update(
        id: number,
        name: string,
        image: string
    ): Promise<ProductCategory | null> {
        const query = `
      UPDATE product_category
      SET
        name = $1,
      image = $2
      WHERE id = $3 AND deleted_at IS NULL
      RETURNING *;
    `;

      const { rows } = await pool.query<ProductCategory>(query, [name, image, id]);

        return rows[0] ?? null;
    }

    // Delete
    static async delete(id: number): Promise<"deleted" | "in_use" | "not_found"> {
        const query = `
      update product_category
      set deleted_at= now()
      WHERE id = $1
        AND deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM product
            WHERE product.category_id = product_category.id
              AND product.deleted_at IS NULL
        );
    `;

        const result = await pool.query(query, [id]);
        if (result.rowCount === 1) {
            return "deleted";
        }
        const existing = await pool.query(
            "SELECT EXISTS(SELECT 1 FROM product_category WHERE id = $1 AND deleted_at IS NULL) AS exists",
            [id]
        );
        return existing.rows[0]?.exists ? "in_use" : "not_found";
    }
}