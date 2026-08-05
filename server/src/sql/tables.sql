-- Product_category table
create table product_category(
id serial primary key,
name varchar(50) unique not null,
slug varchar(50) unique not null,
status varchar(20) not null default('active') check(status in ('active','inactive')),
created_at timestamptz not null default CURRENT_TIMESTAMP,
updated_at timestamptz not null default CURRENT_TIMESTAMP,
deleted_at timestamptz default null
);
