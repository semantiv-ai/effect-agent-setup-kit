import { spawnSync } from "node:child_process"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const keep = process.env.KEEP_SMOKE_DIR === "1"
const target = fs.mkdtempSync(path.join(os.tmpdir(), "effect-agent-smoke-"))

const run = (label, command, args, cwd) => {
  console.log(`\n> ${label}`)
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit"
  })
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}.`)
  }
}

try {
  run("generate project", "node", [path.join(kitRoot, "scripts", "setup.mjs"), target, "--effect-version", "current"], kitRoot)

  const receipt = path.join(target, "SETUP-RECEIPT.md")
  if (!fs.existsSync(receipt)) {
    throw new Error("SETUP-RECEIPT.md was not written.")
  }
  const receiptText = fs.readFileSync(receipt, "utf8")
  if (!receiptText.includes("Status: ready for Effect agent coding.")) {
    throw new Error("SETUP-RECEIPT.md does not contain the ready status.")
  }

  run("check generated project", "pnpm", ["run", "check"], target)
  console.log(`\nSmoke test passed: ${target}`)
} finally {
  if (keep) {
    console.log(`Keeping smoke directory: ${target}`)
  } else {
    fs.rmSync(target, { recursive: true, force: true })
  }
}
