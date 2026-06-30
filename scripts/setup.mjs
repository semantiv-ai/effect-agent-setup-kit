#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const scriptPath = fileURLToPath(import.meta.url)
const scriptDir = path.dirname(scriptPath)
const kitRoot = path.resolve(scriptDir, "..")
const templateRoot = path.join(kitRoot, "templates", "default")
const effectSmolUrl = "https://github.com/Effect-TS/effect-smol.git"

const usage = `Usage: node scripts/setup.mjs <target-dir> [--effect-version current|latest|<exact-version>]

Options:
  --effect-version  current uses this setup-kit package.json version.
                    latest resolves the npm beta dist-tag for effect.
                    Any other value is used as an exact version.
`

const parseArgs = (argv) => {
  let target = undefined
  let effectVersion = "current"

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--help" || arg === "-h") {
      console.log(usage)
      process.exit(0)
    }
    if (arg === "--effect-version") {
      const value = argv[index + 1]
      if (value === undefined) {
        throw new Error("--effect-version requires a value.")
      }
      effectVersion = value
      index += 1
      continue
    }
    if (arg.startsWith("--effect-version=")) {
      effectVersion = arg.slice("--effect-version=".length)
      continue
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`)
    }
    if (target !== undefined) {
      throw new Error(`Unexpected extra target argument: ${arg}`)
    }
    target = arg
  }

  if (target === undefined) {
    throw new Error(`Missing target-dir.\n\n${usage}`)
  }

  return {
    effectVersion,
    target: path.resolve(process.cwd(), target)
  }
}

const run = (label, command, args, options = {}) => {
  console.log(`\n> ${label}`)
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    stdio: options.stdio ?? "inherit"
  })
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}.`)
  }
  return result
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"))

const resolveEffectVersion = (mode) => {
  if (mode === "current") {
    const packageJson = readJson(path.join(kitRoot, "package.json"))
    const version = packageJson.dependencies?.effect ?? packageJson.devDependencies?.effect
    if (typeof version !== "string" || version.length === 0) {
      throw new Error("setup-kit package.json does not declare an effect version.")
    }
    return version
  }

  if (mode === "latest") {
    const result = spawnSync("npm", ["view", "effect@beta", "version", "--json"], {
      cwd: kitRoot,
      encoding: "utf8",
      stdio: "pipe"
    })
    if (result.status !== 0) {
      throw new Error([
        "Failed to resolve npm beta dist-tag for effect.",
        result.stdout.trim(),
        result.stderr.trim()
      ].filter(Boolean).join("\n"))
    }
    const parsed = JSON.parse(result.stdout)
    if (typeof parsed !== "string" || parsed.length === 0) {
      throw new Error("npm did not return a usable effect@beta version.")
    }
    return parsed
  }

  if (mode.trim().length === 0) {
    throw new Error("--effect-version cannot be empty.")
  }
  return mode
}

const projectNameFromTarget = (target) => {
  const base = path.basename(target)
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return normalized.length > 0 ? normalized : "effect-app"
}

const renderTemplate = (content, values) =>
  content
    .replaceAll("__PROJECT_NAME__", values.projectName)
    .replaceAll("__EFFECT_VERSION__", values.effectVersion)

const copyTemplateTree = (source, destination, values) => {
  fs.mkdirSync(destination, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)
    if (entry.isDirectory()) {
      copyTemplateTree(sourcePath, destinationPath, values)
      continue
    }
    if (!entry.isFile()) {
      continue
    }
    const content = fs.readFileSync(sourcePath, "utf8")
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    fs.writeFileSync(destinationPath, renderTemplate(content, values))
  }
}

const copyVerifier = (target) => {
  const targetScript = path.join(target, "scripts", "test-setup.mjs")
  fs.mkdirSync(path.dirname(targetScript), { recursive: true })
  fs.copyFileSync(path.join(scriptDir, "test-setup.mjs"), targetScript)
}

const cloneEffectSmol = (target, effectVersion) => {
  const reposDir = path.join(target, ".repos")
  const cloneDir = path.join(reposDir, "effect-smol")
  fs.mkdirSync(reposDir, { recursive: true })
  fs.rmSync(cloneDir, { recursive: true, force: true })
  run(
    `clone effect-smol tag effect@${effectVersion}`,
    "git",
    ["clone", "--depth", "1", "--branch", `effect@${effectVersion}`, effectSmolUrl, cloneDir],
    { cwd: target }
  )
}

const main = () => {
  const args = parseArgs(process.argv.slice(2))
  const effectVersion = resolveEffectVersion(args.effectVersion)
  const values = {
    effectVersion,
    projectName: projectNameFromTarget(args.target)
  }

  console.log(`Setting up Effect agent project at ${args.target}`)
  console.log(`Effect version: ${effectVersion}`)
  fs.mkdirSync(args.target, { recursive: true })
  copyTemplateTree(templateRoot, args.target, values)
  copyVerifier(args.target)
  run("install dependencies", "pnpm", ["install"], { cwd: args.target })
  run("patch TypeScript for Effect language-service", "pnpm", ["exec", "effect-language-service", "patch"], {
    cwd: args.target
  })
  cloneEffectSmol(args.target, effectVersion)
  run("verify setup", "pnpm", ["run", "setup:test"], { cwd: args.target })
  console.log("\nEffect agent setup completed.")
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
