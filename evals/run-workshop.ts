import { createWorkshopFirstResponse, workshopResponseSchema } from "../lib/workshop";
import { workshopFixtures, type WorkshopFixture } from "./fixtures";

const bannedOpeners = [
  "interesting",
  "i love",
  "great",
  "that's a strong",
  "what a",
  "amazing",
  "impressive",
  "wonderful",
  "love this",
  "excellent",
  "fantastic",
  "brilliant",
  "exciting",
];

const green = (value: string) => `\u001b[32m${value}\u001b[0m`;
const red = (value: string) => `\u001b[31m${value}\u001b[0m`;

function normalized(value: string) {
  return value.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9'\s]/g, " ");
}

function opensWithBannedPraise(reply: string) {
  const opening = normalized(reply).trimStart();
  return bannedOpeners.find((opener) => opening.startsWith(opener));
}

function mirrorText(fixture: WorkshopFixture) {
  const { letter, profile } = fixture.mirror;
  return [letter, ...profile.themes, ...profile.strengths, ...profile.interests, ...profile.obsessions, profile.working_style]
    .map(normalized)
    .join(" ");
}

function hasMirrorAnchor(fixture: WorkshopFixture, anchor: string) {
  const sourceTokens = new Set(mirrorText(fixture).split(/\s+/).filter((token) => token.length >= 4));
  const overlappingTokens = new Set(
    normalized(anchor).split(/\s+/).filter((token) => sourceTokens.has(token)),
  );
  return anchor.trim().length > 0 && overlappingTokens.size >= 2;
}

async function runFixture(fixture: WorkshopFixture) {
  const response = workshopResponseSchema.parse(
    await createWorkshopFirstResponse(fixture.mirror, fixture.idea),
  );
  const failures: string[] = [];
  const bannedOpener = opensWithBannedPraise(response.reply);

  if (response.phase !== "challenging") failures.push(`expected challenging phase, received ${response.phase}`);
  if (bannedOpener) failures.push(`opens with banned praise: "${bannedOpener}"`);
  if (!hasMirrorAnchor(fixture, response.mirror_anchor)) {
    failures.push("mirror_anchor is empty or does not quote/closely paraphrase the fixture Mirror");
  }

  return failures;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(red("OPENAI_API_KEY is required to run workshop evals."));
    process.exitCode = 1;
    return;
  }

  let passed = 0;
  for (const fixture of workshopFixtures) {
    try {
      const failures = await runFixture(fixture);
      if (failures.length === 0) {
        passed += 1;
        console.log(green(`✓ ${fixture.id}`));
      } else {
        console.log(red(`✗ ${fixture.id}`));
        failures.forEach((failure) => console.log(red(`  - ${failure}`)));
      }
    } catch (error) {
      console.log(red(`✗ ${fixture.id}`));
      console.log(red(`  - ${error instanceof Error ? error.message : "Unknown evaluation failure"}`));
    }
  }

  const failed = workshopFixtures.length - passed;
  console.log(failed === 0
    ? green(`PASS: ${passed}/${workshopFixtures.length} workshop evals passed.`)
    : red(`FAIL: ${passed}/${workshopFixtures.length} workshop evals passed; ${failed} failed.`));
  if (failed > 0) process.exitCode = 1;
}

void main();
