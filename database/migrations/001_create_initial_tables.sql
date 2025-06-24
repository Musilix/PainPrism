CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255) UNIQUE NOT NULL,
    source_url VARCHAR(2048) NOT NULL,
    title TEXT NOT NULL,
    author VARCHAR(255),
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    source_comment_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    text_summary TEXT NOT NULL,
    tags TEXT[],
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    representative_text TEXT NOT NULL,
    popularity_score INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insight_cluster_link (
    insight_id INTEGER REFERENCES insights(id) ON DELETE CASCADE,
    cluster_id INTEGER REFERENCES clusters(id) ON DELETE CASCADE,
    PRIMARY KEY (insight_id, cluster_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON insights USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);