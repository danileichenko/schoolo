CREATE TABLE IF NOT EXISTS staff_members (
    id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    work_email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    failed_sign_in_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT staff_members_pkey PRIMARY KEY (id),
    CONSTRAINT staff_members_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT staff_members_work_email_key UNIQUE (work_email)
);

CREATE INDEX IF NOT EXISTS staff_members_school_id_idx ON staff_members (school_id);
