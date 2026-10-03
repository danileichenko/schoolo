export type SchoolRecord = {
  id: string;
  name: string;
  createdAt: Date;
};

export type SchoolRepository = {
  findByName(name: string): Promise<SchoolRecord | null>;
  create(school: SchoolRecord): Promise<SchoolRecord>;
};
