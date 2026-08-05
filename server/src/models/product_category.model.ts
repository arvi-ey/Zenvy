import { pool } from "../config/db.js";

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date
}

export class ProductCategoryModel {
    // Create
    static async create(name: string): Promise<ProductCategory> {
        const slugname = name
        const query = `
      INSERT INTO product_category (name, slug)
      VALUES ($1, generate_slug($2))
      RETURNING *;
    `;

        const { rows } = await pool.query<ProductCategory>(query, [name, slugname]);

        return rows[0];
    }

    // Get All
    static async findAll(): Promise<ProductCategory[]> {
        const query = `
      SELECT *
      FROM product_category
      WHERE deleted_at IS NULL AND status = 'active'
      ORDER BY id ASC ;
    `;

        const { rows } = await pool.query<ProductCategory>(query);

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
        name: string
    ): Promise<ProductCategory | null> {
        const query = `
      UPDATE product_category
      SET
        name = $1,
        slug = generate_slug($1)
      WHERE id = $2 AND  deleted_at IS NULL
      RETURNING *;
    `;

        const { rows } = await pool.query<ProductCategory>(query, [name, id]);

        return rows[0] ?? null;
    }

    // Delete
    static async delete(id: number): Promise<boolean> {
        const query = `
      update product_category
      set deleted_at= now()
      WHERE id = $1 AND deleted_at IS NULL;
    `;

        const result = await pool.query(query, [id]);

        return result.rowCount === 1;
    }
}