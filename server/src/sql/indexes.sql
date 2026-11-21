--Partial unique index for cart table
DROP INDEX IF EXISTS cart_user_product_unique;
CREATE UNIQUE INDEX cart_user_product_unique
ON cart(user_id, product_id, variant_id)
WHERE user_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX address_user_active_idx
ON address(user_id, created_at DESC)
WHERE deleted_at IS NULL;