-- Product_category table
create table product_category(
id serial primary key,
name varchar(50) unique not null,
slug varchar(50) unique not null,
image TEXT NOT NULL,
status varchar(20) not null default('active') check(status in ('active','inactive')),
created_at timestamptz not null default CURRENT_TIMESTAMP,
updated_at timestamptz not null default CURRENT_TIMESTAMP,
deleted_at timestamptz default null
);



--Products table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT(0),
    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),
    status VARCHAR(20) NOT NULL
        DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'draft')),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES product_category(id)
        ON DELETE RESTRICT
);


--Product Images

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    product_id INT NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT fk_product_id
        FOREIGN KEY (product_id)
        REFERENCES product(id)
        ON DELETE CASCADE
);


--Product reviews table
CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,

    product_id INT NOT NULL,
    user_id INT NOT NULL,

    rating INT NOT NULL
        CHECK (rating >= 1 AND rating <= 5),

    review TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_product_review
        UNIQUE (user_id, product_id)
);

--users table
CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   first_name VARCHAR(50) NOT NULL,
   last_name VARCHAR(50) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   phone VARCHAR(15) UNIQUE NOT NULL,
   avatar TEXT,
   status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'not_active', 'suspended')), 
   verified BOOLEAN NOT NULL DEFAULT FALSE,
   created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
   deleted_at TIMESTAMPTZ DEFAULT NULL
);



--Address table
CREATE TABLE address (
    id SERIAL PRIMARY KEY,

  user_id INT NOT NULL,

    street TEXT NOT NULL,
    landmark TEXT,

    pincode VARCHAR(20) NOT NULL,
    state VARCHAR(110) NOT NULL,
    district VARCHAR(100) NOT NULL,

    type VARCHAR(20)
        NOT NULL
        DEFAULT 'others'
        CHECK (type IN ('office', 'home', 'others')),

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT address_fkey_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);