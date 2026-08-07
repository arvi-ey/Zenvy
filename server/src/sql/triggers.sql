-- trigger for updatedat (table name chnages for other table)
CREATE TRIGGER trg_product_category_updated_at
BEFORE UPDATE
ON product_category
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

--trigger for slug auto genaration (table name chnages for other table)
CREATE TRIGGER trg_product_category_slug
BEFORE INSERT OR UPDATE OF name
ON product_category
FOR EACH ROW
EXECUTE FUNCTION set_slug();