CREATE TABLE IF NOT EXISTS teacher_invites (
    id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    work_email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT teacher_invites_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_invites_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT teacher_invites_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS teacher_invites_school_id_idx ON teacher_invites (school_id);
CREATE INDEX IF NOT EXISTS teacher_invites_school_email_status_idx
    ON teacher_invites (school_id, work_email, status);
