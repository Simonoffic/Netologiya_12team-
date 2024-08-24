CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL
);

CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL REFERENCES movies(id),
    liked BOOLEAN NOT NULL
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    identifier INT UNIQUE NOT NULL
);

INSERT INTO genres (name, identifier) VALUES
('Mystery', 0),
('War', 1),
('Sci-Fi', 2),
('Western', 3),
('IMAX', 4),
('Animation', 5),
('Musical', 6),
('Horror', 7),
('Fantasy', 8),
('Crime', 9),
('Drama', 10),
('Action', 11),
('Adventure', 12),
('Comedy', 13),
('Children', 14),
('Romance', 15),
('Film-Noir', 16),
('Documentary', 17),
('Thriller', 18);

CREATE TABLE movie_genres (
    movie_id INT NOT NULL REFERENCES movies(id),
    genre_id INT NOT NULL REFERENCES genres(id),
    PRIMARY KEY (movie_id, genre_id)
);
