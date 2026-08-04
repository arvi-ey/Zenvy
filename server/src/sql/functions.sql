-- slug geneeration 

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            trim(input_text),
            '\s+',
            '-',
            'g'
        )
    );
END;
$$;


--Updated at auto update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- trigger for updatedat (table name chnages for other table)
CREATE TRIGGER trg_product_category_updated_at
BEFORE UPDATE
ON product_category
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();