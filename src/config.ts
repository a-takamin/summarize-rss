// 環境変数から設定を読み込む

import { config as dotenvConfig } from "dotenv";

// .env.local があれば読み込む
dotenvConfig({ path: ".env.local" });

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

// FreshRSS モック使用フラグを先に読み込む
const useFreshRSSMock = getEnvBoolean("USE_FRESHRSS_MOCK", false);

export const config = {
  // FreshRSS（モック使用時は空でも OK）
  freshrss: {
    useMock: useFreshRSSMock,
    baseUrl: useFreshRSSMock ? "" : getEnvOrThrow("FRESHRSS_BASE_URL"),
    username: useFreshRSSMock ? "" : getEnvOrThrow("FRESHRSS_USERNAME"),
    password: useFreshRSSMock ? "" : getEnvOrThrow("FRESHRSS_API_PASSWORD"),
  },

  // Bedrock
  bedrock: {
    region: getEnvOrDefault("BEDROCK_REGION", "us-east-1"),
  },

  // SES
  ses: {
    region: getEnvOrDefault("SES_REGION", "ap-northeast-1"),
    fromAddress: getEnvOrThrow("SES_FROM_ADDRESS"),
    toAddress: getEnvOrThrow("SES_TO_ADDRESS"),
  },
} as const;
