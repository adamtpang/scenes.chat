import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { get, list } from "@vercel/blob";

if (!process.env.BLOB_READ_WRITE_TOKEN && existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  process.stderr.write(
    "Missing BLOB_READ_WRITE_TOKEN. Run `vercel env pull .env.local` first.\n",
  );
  process.exitCode = 1;
} else {
  const applications = [];
  let cursor;

  do {
    const page = await list({ prefix: "applications/", cursor, token });

    for (const blob of page.blobs) {
      const result = await get(blob.url, {
        access: "private",
        useCache: false,
        token,
      });

      if (!result || result.statusCode !== 200 || !result.stream) continue;

      try {
        const application = await new Response(result.stream).json();
        if (application && typeof application === "object") {
          applications.push(application);
        }
      } catch {
        process.stderr.write(`Skipped unreadable record: ${blob.pathname}\n`);
      }
    }

    cursor = page.cursor;
  } while (cursor);

  const columns = [
    "submittedAt",
    "email",
    "deepIn",
    "topics",
    "slot",
    "language",
    "wants",
    "isAdult",
  ];

  const cell = (value) => {
    const text = Array.isArray(value)
      ? value.join(" | ")
      : value === undefined || value === null
        ? ""
        : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  applications.sort((left, right) =>
    String(left.submittedAt ?? "").localeCompare(
      String(right.submittedAt ?? ""),
    ),
  );

  const rows = [
    columns.map(cell).join(","),
    ...applications.map((application) =>
      columns.map((column) => cell(application[column])).join(","),
    ),
  ];

  process.stdout.write(`${rows.join("\n")}\n`);
}
