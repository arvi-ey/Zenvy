-- Run after tables.sql when upgrading an existing database.
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS sku TEXT,
    ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS product_sku_unique_idx
    ON product (sku)
    WHERE sku IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_compare_at_price_nonnegative'
          AND conrelid = 'product'::regclass
    ) THEN
        ALTER TABLE product ADD CONSTRAINT product_compare_at_price_nonnegative
            CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_cost_price_nonnegative'
          AND conrelid = 'product'::regclass
    ) THEN
        ALTER TABLE product ADD CONSTRAINT product_cost_price_nonnegative
            CHECK (cost_price IS NULL OR cost_price >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_low_stock_threshold_nonnegative'
          AND conrelid = 'product'::regclass
    ) THEN
        ALTER TABLE product ADD CONSTRAINT product_low_stock_threshold_nonnegative
            CHECK (low_stock_threshold >= 0);
    END IF;
END
$$;
