CREATE TABLE investigations (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    start_chain VARCHAR(50) NOT NULL,
    start_address VARCHAR(255) NOT NULL,
    max_hops INTEGER NOT NULL,
    min_value DOUBLE PRECISION,
    from_date TIMESTAMP WITH TIME ZONE,
    to_date TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(50) NOT NULL,
    progress INTEGER DEFAULT 0,
    current_stage VARCHAR(255),
    
    nodes_found INTEGER DEFAULT 0,
    edges_found INTEGER DEFAULT 0,
    
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_investigations_case_id ON investigations(case_id);

CREATE TABLE investigation_nodes (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    chain VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    hop INTEGER NOT NULL,
    entity_id UUID REFERENCES entities(id),
    risk_score INTEGER,
    CONSTRAINT uq_inv_chain_address UNIQUE (investigation_id, chain, address)
);

CREATE INDEX idx_investigation_nodes_inv_id ON investigation_nodes(investigation_id);

CREATE TABLE investigation_edges (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    chain VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL,
    
    source_chain VARCHAR(50) NOT NULL,
    source_address VARCHAR(255) NOT NULL,
    
    target_chain VARCHAR(50) NOT NULL,
    target_address VARCHAR(255) NOT NULL,
    
    asset VARCHAR(100),
    amount DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_investigation_edges_inv_id ON investigation_edges(investigation_id);
CREATE INDEX idx_investigation_edges_tx_hash ON investigation_edges(tx_hash);
