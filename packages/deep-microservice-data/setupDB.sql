create table business (
    id serial primary key,
    name text
);

create table edge (
    first integer references business,
    second integer references business,
    primary key (first, second)
)