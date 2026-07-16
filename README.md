# Whetstone

Whetstone v1 existed on a no-code platform. This repository is a ground-up rebuild started July 13, 2026; prior prompts and design decisions were carried over as design inputs only.

## Development

### Database schema

Schema changes are applied by pasting the relevant Drizzle migration SQL into the Supabase SQL Editor. Vercel builds do not run database migrations.
