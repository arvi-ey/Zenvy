--Partial unique index for cart table
CREATE UNIQUE INDEX cart_user_product_unique
ON cart(user_id, product_id)
WHERE deleted_at IS NULL;

CREATE INDEX address_user_active_idx
ON address(user_id, created_at DESC)
WHERE deleted_at IS NULL;