export const MODEL = {
  CLAUDE_HAIKU_4_5: {
    id: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
  },
  CLAUDE_SONNET_4_5: {
    id: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
  },
} as const;

export type BedrockModelID = (typeof MODEL)[keyof typeof MODEL]["id"];
