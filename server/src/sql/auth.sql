-- Run after the base schema in tables.sql to enable password-based sessions and RBAC.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer'
CHECK (role IN ('customer', 'admin'));

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'users'
          AND column_name = 'user_type'
    ) THEN
        EXECUTE $migration$
            UPDATE users
            SET role = CASE user_type
                WHEN 'admin' THEN 'admin'
                WHEN 'user' THEN 'customer'
                ELSE role
            END
        $migration$;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS auth_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
ON auth_sessions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
ON users (lower(email));
