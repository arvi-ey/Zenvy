-- slug geneeration function

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


--set unique slug function
CREATE OR REPLACE FUNCTION set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.slug :=
        generate_slug(NEW.name)
        || '-'
        || LEFT(md5(random()::text), 8);

    RETURN NEW;
END;
$$;

--Updated at auto update function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


