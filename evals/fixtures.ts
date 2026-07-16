import type { WorkshopMirror } from "../lib/workshop";

export type WorkshopFixture = {
  id: string;
  idea: string;
  mirror: WorkshopMirror;
};

export const workshopFixtures: WorkshopFixture[] = [
  {
    id: "free-distribution",
    idea: "I'll make a free habit app, launch it on Product Hunt, and assume the users will spread it everywhere without a marketing budget.",
    mirror: {
      letter: "You keep returning to finding overlooked channels rather than waiting for attention to arrive.",
      profile: {
        themes: ["Finding hidden distribution paths"],
        strengths: ["Turning sparse signals into targeted outreach"],
        interests: ["Community research"],
        obsessions: ["Who is missing from the obvious list"],
        working_style: "Tests a narrow channel before building around it.",
      },
    },
  },
  {
    id: "scope-tripling",
    idea: "I'm starting with a simple meal-planning tool, then adding grocery delivery, nutrition coaching, a social feed, and a marketplace for chefs before launch.",
    mirror: {
      letter: "Your strongest work comes from stripping a complicated process down to the smallest useful move.",
      profile: {
        themes: ["Reducing friction"],
        strengths: ["Choosing a sharp first version"],
        interests: ["Useful tools"],
        obsessions: ["The smallest thing that changes behavior"],
        working_style: "Prefers a narrow test over a sprawling first release.",
      },
    },
  },
  {
    id: "everyone-wants-this",
    idea: "Everyone will want an AI wardrobe assistant because nobody likes deciding what to wear, so I can build for everyone from day one.",
    mirror: {
      letter: "You notice the difference between a broad complaint and a specific person with an expensive, repeated problem.",
      profile: {
        themes: ["Specific users over abstract markets"],
        strengths: ["Finding costly repeated pain"],
        interests: ["Customer interviews"],
        obsessions: ["Who feels the problem most sharply"],
        working_style: "Starts by locating a narrow, high-friction use case.",
      },
    },
  },
  {
    id: "trust-assumption",
    idea: "I'll collect people's financial accounts in one dashboard and recommend moves automatically; users will trust it because the advice is personalized.",
    mirror: {
      letter: "You build credibility by making the mechanism visible instead of asking people to accept a black box.",
      profile: {
        themes: ["User control"],
        strengths: ["Making systems legible"],
        interests: ["Decision tools"],
        obsessions: ["Where people lose agency"],
        working_style: "Makes the reasoning and controls visible to the user.",
      },
    },
  },
  {
    id: "marketplace-cold-start",
    idea: "I'll build a marketplace for local tutors and parents; once it's live, both sides will join because it is clearly useful.",
    mirror: {
      letter: "When a process depends on two groups finding each other, you first create a deliberate path into one side rather than waiting for a network effect.",
      profile: {
        themes: ["Deliberate acquisition"],
        strengths: ["Designing entry paths"],
        interests: ["Local networks"],
        obsessions: ["Who arrives first"],
        working_style: "Builds a concrete wedge before relying on scale.",
      },
    },
  },
  {
    id: "manual-work-hidden",
    idea: "I'll promise a same-day custom research brief for every customer, then personally make each one until the business is big enough to automate it.",
    mirror: {
      letter: "You are most useful when you turn recurring manual work into a system another person can steer themselves.",
      profile: {
        themes: ["Reusable systems"],
        strengths: ["Spotting automation candidates"],
        interests: ["Research workflows"],
        obsessions: ["Repeated manual steps"],
        working_style: "Looks for the repeatable system hidden inside a one-off service.",
      },
    },
  },
];
