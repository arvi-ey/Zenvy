--Partial unique index for cart table
CREATE UNIQUE INDEX cart_user_product_unique
ON cart(user_id, product_id)
WHERE deleted_at IS NULL;