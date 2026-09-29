ALTER TABLE findings ALTER COLUMN evidence TYPE TEXT USING evidence::text;
ALTER TABLE risk_scores ALTER COLUMN reasons TYPE TEXT USING reasons::text;
