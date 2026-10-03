CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL,
    staff_member_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessions_staff_member_id_fkey
        FOREIGN KEY (staff_member_id) REFERENCES staff_members (id) ON DELETE CASCADE,
    CONSTRAINT sessions_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS sessions_staff_member_id_idx ON sessions (staff_member_id);
