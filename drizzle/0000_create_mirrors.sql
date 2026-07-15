CREATE TABLE "mirrors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "mood_raw" text NOT NULL,
  "transcript" jsonb NOT NULL,
  "letter" text NOT NULL,
  "cards" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
