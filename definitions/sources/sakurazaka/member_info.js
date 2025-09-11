const [DATABASE_NAME, DATASET_NAME, TABLE_NAME] = [
  "sakamichipenlightquiz",
  "sakurazaka",
  "member_info",
];

declare({
  database: DATABASE_NAME,
  schema: DATASET_NAME,
  name: TABLE_NAME,
});
