CREATE TABLE cases (
    id UUID PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_wallets (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    chain VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_case_chain_address UNIQUE (case_id, chain, address)
);

CREATE INDEX idx_case_wallets_case_id ON case_wallets(case_id);
