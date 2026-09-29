CREATE TABLE entities (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entity_addresses (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    chain VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    label_type VARCHAR(100),
    confidence DOUBLE PRECISION,
    source VARCHAR(255),
    last_verified TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_entity_chain_address UNIQUE (entity_id, chain, address)
);

CREATE INDEX idx_entity_addresses_chain_address ON entity_addresses(chain, address);
