CREATE TABLE findings (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_scores (
    id UUID PRIMARY KEY,
    wallet_chain VARCHAR(50) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    reasons JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_risk_chain_address UNIQUE (wallet_chain, wallet_address)
);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vasp_requests (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES investigations(id) ON DELETE SET NULL,
    entity_id UUID NOT NULL REFERENCES entities(id),
    request_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
