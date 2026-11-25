import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HANDLE = "0xcqing";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

type HandleFacts = {
  handle: string;
  characters: number;
  bytes: number;
  isSingleToken: boolean;
};

function handleFacts(text: string): HandleFacts {
  return {
    handle: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    isSingleToken: !/\s/.test(text) && !text.includes(","),
  };
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function writeEntry(): void {
  const facts = handleFacts(HANDLE);
  const text = facts.handle;

  if (text.trim().length === 0) {
    fail("handle is empty after trimming");
  }
  if (facts.characters < 1 || facts.characters > 30) {
    fail("handle length is not between 1 and 30 characters");
  }
  if (facts.bytes < 1 || facts.bytes > 30) {
    fail("handle is not between 1 and 30 bytes");
  }
  if (/[\r\n]/.test(text)) {
    fail("handle contains a newline character");
  }
  if (/\s/.test(text)) {
    fail("handle contains whitespace");
  }
  if (text.includes(",")) {
    fail("handle contains a comma");
  }
  if (!facts.isSingleToken) {
    fail("handle is not a single token");
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const entryPath = join(OUTPUT_DIR, "entry.txt");
  const payload = `${text}\n`;
  writeFileSync(entryPath, payload, { encoding: "utf8" });

  const readBack = readFileSync(entryPath);
  const expected = Buffer.from(payload, "utf8");
  if (!readBack.equals(expected)) {
    fail("read-back bytes do not match the bytes written");
  }

  process.stdout.write(`path: ${entryPath}\n`);
  process.stdout.write(`handle: ${facts.handle}\n`);
  process.stdout.write(`characters: ${facts.characters}\n`);
  process.stdout.write(`bytes: ${facts.bytes}\n`);
  process.stdout.write(`isSingleToken: ${facts.isSingleToken}\n`);
}

writeEntry();
