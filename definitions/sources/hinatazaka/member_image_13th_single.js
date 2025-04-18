const [DATABASE_NAME, DATASET_NAME, TABLE_NAME] = [
  "sakamichipenlightquiz",
  "hinatazaka",
  "member_image_13th_single",
];

declare({
  database: DATABASE_NAME,
  schema: DATASET_NAME,
  name: TABLE_NAME,
});
