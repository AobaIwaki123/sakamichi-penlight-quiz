const [DATABASE_NAME, DATASET_NAME, TABLE_NAME] = [
  "sakamichipenlightquiz",
  "sakurazaka",
  "member_image_2nd_album",
];

declare({
  database: DATABASE_NAME,
  schema: DATASET_NAME,
  name: TABLE_NAME,
});
