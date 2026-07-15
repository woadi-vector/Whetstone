CREATE TABLE "mirrors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "mood_raw" text NOT NULL,
  "transcript" jsonb NOT NULL,
  "letter" text NOT NULL,
  "cards" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
