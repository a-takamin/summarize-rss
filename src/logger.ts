// LogTape の設定

import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

export async function setupLogger(): Promise<void> {
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: (record) => {
          const timestamp = new Date(record.timestamp).toISOString();
          const level = record.level.toUpperCase().padEnd(5);
          const category = record.category.join(".");
          const message = record.message
            .map((m) => (typeof m === "string" ? m : JSON.stringify(m)))
            .join(" ");
          return `${timestamp} [${level}] ${category}: ${message}`;
        },
      }),
    },
    loggers: [
      {
        category: ["summarize-rss"],
        lowestLevel: "info",
        sinks: ["console"],
      },
    ],
  });
}

export function createLogger(
  ...subcategory: string[]
): ReturnType<typeof getLogger> {
  return getLogger(["summarize-rss", ...subcategory]);
}
