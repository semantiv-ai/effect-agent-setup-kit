import { spawnSync } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"

const root = process.cwd()
const probeDir = path.join(root, ".setup-probes")

const requiredEffectDiagnostics = [
  "floatingEffect",
  "missingEffectContext",
  "missingStarInYieldEffectGen",
  "globalConsoleInEffect",
  "globalFetchInEffect",
  "processEnvInEffect",
  "preferSchemaOverJson"
]

const requiredOxlintRules = [
  "eslint(no-console)",
  "node(no-process-env)",
  "eslint(no-restricted-globals)",
  "eslint(no-restricted-properties)"
]

const ignoredReferenceChecks = new Set(["node_modules", ".repos", ".setup-probes", ".git"])
const removedProjectNamePattern = new RegExp("clan" + "ka", "i")
const removedProjectOutputDirectory = "." + "clan" + "ka"

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"))

const run = (label, command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    ...options
  })

  if (!options.allowFailure && result.status !== 0) {
    throw new Error([
      `${label} failed with exit code ${result.status ?? "unknown"}.`,
      result.stdout.trim(),
      result.stderr.trim()
    ].filter(Boolean).join("\n"))
  }

  return result
}

const parseJsonOutput = (label, output) => {
  const start = output.indexOf("{")
  if (start === -1) {
    throw new Error(`${label} did not emit JSON.`)
  }
  return JSON.parse(output.slice(start))
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const pass = (message) => {
  console.log(`OK ${message}`)
}

const writeSetupReceipt = () => {
  const packageJson = readJson("package.json")
  const effectSmol = path.join(root, ".repos", "effect-smol")
  const effectVersion = packageJson.dependencies.effect
  const effectVitestVersion = packageJson.devDependencies["@effect/vitest"]
  const effectSmolHead = run("effect-smol receipt HEAD", "git", ["-C", effectSmol, "rev-parse", "--short", "HEAD"]).stdout.trim()
  const receipt = [
    "# Setup Receipt",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Project: ${packageJson.name}`,
    `Effect version: ${effectVersion}`,
    `@effect/vitest version: ${effectVitestVersion}`,
    `effect-smol tag: effect@${effectVersion}`,
    `effect-smol commit: ${effectSmolHead}`,
    "",
    "Status: ready for Effect agent coding.",
    "",
    "Verified checks:",
    "",
    "- static setup contract",
    "- effect and @effect/vitest version pairing",
    "- pinned .repos/effect-smol reference clone",
    "- generated code does not import from .repos",
    "- TypeScript patched for the Effect language service",
    "- TypeScript typecheck",
    "- Effect language-service diagnostics",
    "- type-aware oxlint",
    "- Vitest tests",
    "- negative Effect diagnostic probes",
    "- negative oxlint probes",
    "",
    "Next commands:",
    "",
    "```sh",
    "pnpm run setup:test",
    "pnpm run check",
    "```",
    "",
    "Agent starting points:",
    "",
    "- AGENTS.md",
    "- patterns/effect-skill-index.md",
    "- .repos/effect-smol/LLMS.md",
    "- docs/reference/effect-ai-chat-example/knowledge/skills/",
    ""
  ].join("\n")

  fs.writeFileSync(path.join(root, "SETUP-RECEIPT.md"), receipt)
  pass("setup receipt written to SETUP-RECEIPT.md")
}

const walkTextFiles = (directory, visit) => {
  if (!fs.existsSync(directory)) {
    return
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredReferenceChecks.has(entry.name)) {
      continue
    }
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walkTextFiles(file, visit)
      continue
    }
    if (entry.isFile()) {
      visit(file, fs.readFileSync(file, "utf8"))
    }
  }
}

const checkStaticConfig = () => {
  const packageJson = readJson("package.json")
  const tsconfig = readJson("tsconfig.json")
  const oxlint = readJson(".oxlintrc.json")
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8")
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8")
  const agents = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8")
  const claude = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8")
  const manual = fs.readFileSync(path.join(root, "docs", "agentic-effect-setup-manual.md"), "utf8")
  const referenceReadme = fs.readFileSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "README.md"), "utf8")
  const skillIndex = fs.readFileSync(path.join(root, "patterns", "effect-skill-index.md"), "utf8")
  const plugin = tsconfig.compilerOptions.plugins.find(
    (entry) => entry.name === "@effect/language-service"
  )

  assert(plugin !== undefined, "tsconfig.json is missing @effect/language-service.")
  assert(plugin.transform === "@effect/language-service/transform", "Effect transform is not configured.")
  assert(plugin.includeSuggestionsInTsc === true, "Effect suggestions are not included in tsc output.")
  assert(plugin.ignoreEffectErrorsInTscExitCode === false, "Effect errors are ignored in tsc exit codes.")
  assert(plugin.diagnosticSeverity.floatingEffect === "error", "floatingEffect is not an error.")
  assert(plugin.diagnosticSeverity.missingEffectContext === "error", "missingEffectContext is not an error.")
  assert(plugin.diagnosticSeverity.missingEffectError === "error", "missingEffectError is not an error.")
  assert(plugin.diagnosticSeverity.processEnvInEffect === "error", "processEnvInEffect is not an error.")
  assert(plugin.diagnosticSeverity.preferSchemaOverJson === "error", "preferSchemaOverJson is not an error.")
  assert(agents.includes("Effect Agent Setup Instructions"), "AGENTS.md is missing setup agent instructions.")
  assert(claude.includes("Effect Agent Setup Instructions"), "CLAUDE.md is missing Claude Code instructions.")
  assert(claude.includes("mirrors `AGENTS.md`"), "CLAUDE.md does not point back to AGENTS.md.")
  assert(readme.includes("Reference Sources"), "README.md is missing source acknowledgments.")
  assert(readme.includes("effect-ai-chat-example"), "README.md does not acknowledge the copied Effect AI chat example material.")
  assert(readme.includes("MichaelArnaldi"), "README.md does not acknowledge Michael Arnaldi's source workflow.")
  assert(readme.includes("The One Weird Git Trick"), "README.md does not acknowledge Maxwell Brown's local-source article.")
  assert(manual.includes("Manual: Optimizing An Agentic Coding Setup For Effect"), "setup manual is missing.")
  assert(referenceReadme.includes("lucas-barake/effect-ai-chat-example"), "reference README is missing copied-source attribution.")
  assert(skillIndex.includes("effect-core-v4.md"), "Effect skill index is missing copied skill routing.")
  assert(fs.existsSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "knowledge", "skills", "effect-core-v4.md")), "copied Effect core skill is missing.")
  assert(fs.existsSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "knowledge", "skills", "effect-schema-v4.md")), "copied Effect Schema skill is missing.")
  assert(fs.existsSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "knowledge", "skills", "effect-testing-v4.md")), "copied Effect testing skill is missing.")
  assert(fs.existsSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "knowledge", "rules", "effect-atom.md")), "copied Effect Atom rule is missing.")
  assert(fs.existsSync(path.join(root, "docs", "reference", "effect-ai-chat-example", "scripts", "oxlint-rules", "index.mjs")), "copied custom oxlint rule examples are missing.")
  assert(packageJson.dependencies.effect === packageJson.devDependencies["@effect/vitest"], "effect and @effect/vitest versions differ.")

  assert(packageJson.scripts.prepare === "effect-language-service patch", "prepare does not patch TypeScript.")
  assert(packageJson.scripts.typecheck.includes("tsc -p tsconfig.json"), "typecheck does not run tsc.")
  assert(packageJson.scripts["effect:diagnostics"].includes("effect-language-service diagnostics"), "Effect diagnostics script is missing.")
  assert(packageJson.scripts.lint.includes("--type-aware"), "lint is not type-aware.")
  assert(packageJson.scripts.test.includes("vitest run"), "test does not run Vitest.")
  assert(packageJson.scripts.check.includes("effect:diagnostics"), "check does not run Effect diagnostics.")

  assert(oxlint.plugins.includes("eslint"), "oxlint eslint plugin is not enabled.")
  assert(oxlint.plugins.includes("node"), "oxlint node plugin is not enabled.")
  assert(oxlint.rules["eslint/no-console"] === "error", "console usage is not banned by oxlint.")
  assert(oxlint.rules["node/no-process-env"] === "error", "process.env usage is not banned by oxlint.")
  assert(oxlint.rules["no-restricted-globals"][1] === "fetch", "global fetch is not restricted by oxlint.")
  assert(
    oxlint.rules["no-restricted-properties"].some(
      (entry) => entry.object === "JSON" && entry.property === "parse"
    ),
    "JSON.parse is not restricted by oxlint."
  )
  assert(
    oxlint.rules["no-restricted-properties"].some(
      (entry) => entry.object === "JSON" && entry.property === "stringify"
    ),
    "JSON.stringify is not restricted by oxlint."
  )
  assert(!tsconfig.exclude.includes(removedProjectOutputDirectory), "tsconfig.json contains a removed project-specific exclusion.")
  assert(!oxlint.ignorePatterns.includes(`${removedProjectOutputDirectory}/**`), ".oxlintrc.json contains a removed project-specific ignore.")
  assert(!gitignore.includes(removedProjectOutputDirectory), ".gitignore contains a removed project-specific ignore.")

  pass("static guardrail config is present")
}

const checkReferenceClone = () => {
  const packageJson = readJson("package.json")
  const effectSmol = path.join(root, ".repos", "effect-smol")
  const llms = path.join(effectSmol, "LLMS.md")
  const expectedTag = `effect@${packageJson.dependencies.effect}`

  assert(fs.existsSync(llms), ".repos/effect-smol/LLMS.md is missing.")
  const head = run("effect-smol HEAD", "git", ["-C", effectSmol, "rev-parse", "HEAD"]).stdout.trim()
  const tagCommit = run("effect-smol expected tag", "git", ["-C", effectSmol, "rev-parse", `refs/tags/${expectedTag}^{}`]).stdout.trim()
  assert(head === tagCommit, `effect-smol HEAD does not match ${expectedTag}.`)
  pass(`effect-smol reference clone is pinned to ${expectedTag}`)
}

const checkNoReferenceImports = () => {
  const badFiles = []
  for (const directory of ["src", "test"]) {
    walkTextFiles(path.join(root, directory), (file, content) => {
      if (content.includes(".repos/") || content.includes("../.repos") || content.includes("..\\/.repos")) {
        badFiles.push(path.relative(root, file))
      }
    })
  }
  assert(badFiles.length === 0, `generated code imports or references .repos: ${badFiles.join(", ")}`)
  pass("generated code does not import from .repos")
}

const checkNoRemovedReferences = () => {
  const badFiles = []
  walkTextFiles(root, (file, content) => {
    if (removedProjectNamePattern.test(content)) {
      badFiles.push(path.relative(root, file))
    }
  })
  assert(badFiles.length === 0, `removed project-specific references remain: ${badFiles.join(", ")}`)
  pass("removed project-specific references are absent")
}

const checkProjectClean = () => {
  run("typecheck", "pnpm", ["run", "typecheck"])
  pass("TypeScript typecheck passes")

  const result = run(
    "Effect diagnostics",
    "pnpm",
    ["exec", "effect-language-service", "diagnostics", "--project", "tsconfig.json", "--format", "json", "--strict"]
  )
  const payload = parseJsonOutput("Effect diagnostics", result.stdout)
  assert(payload.summary.errors === 0, "project has Effect diagnostic errors.")
  assert(payload.summary.warnings === 0, "project has Effect diagnostic warnings.")
  pass("project has no Effect diagnostics")

  run("lint", "pnpm", ["run", "lint"])
  pass("type-aware oxlint passes")

  run("tests", "pnpm", ["run", "test"])
  pass("Vitest suite passes")
}

const checkPatchedTypeScript = () => {
  run("effect-language-service check", "pnpm", ["exec", "effect-language-service", "check"])
  pass("Effect language-service patch is active")
}

const writeProbeProject = () => {
  fs.rmSync(probeDir, { recursive: true, force: true })
  fs.mkdirSync(probeDir, { recursive: true })

  fs.writeFileSync(
    path.join(probeDir, "tsconfig.json"),
    `${JSON.stringify({
      extends: "../tsconfig.json",
      compilerOptions: {
        noEmit: true
      },
      include: ["*.ts"]
    }, null, 2)}\n`
  )

  fs.writeFileSync(
    path.join(probeDir, "effect-lsp-probe.ts"),
    [
      'import * as Context from "effect/Context"',
      'import * as Effect from "effect/Effect"',
      "",
      "class ProbeService extends Context.Service<ProbeService, {",
      "  readonly read: Effect.Effect<string>",
      '}>()("effect-agent/probes/ProbeService") {}',
      "",
      'Effect.log("floating")',
      "",
      "const missingYield = Effect.gen(function* () {",
      "  yield Effect.succeed(1)",
      "})",
      "",
      "const needsService = Effect.gen(function* () {",
      "  const service = yield* ProbeService",
      "  return yield* service.read",
      "})",
      "",
      "const rawApis = Effect.gen(function* () {",
      '  console.log("use Effect.log instead")',
      "  process.env.EFFECT_BASE_PROBE",
      '  yield* Effect.promise(() => fetch("https://example.invalid"))',
      '  JSON.parse("{}")',
      "})",
      "",
      "Effect.runSync(needsService)",
      "void missingYield",
      "void rawApis",
      ""
    ].join("\n")
  )

  fs.writeFileSync(
    path.join(probeDir, "effect-error-probe.ts"),
    [
      'import * as Effect from "effect/Effect"',
      'import * as Schema from "effect/Schema"',
      "",
      'class ProbeError extends Schema.TaggedErrorClass<ProbeError>()("ProbeError", {',
      "  message: Schema.String",
      "}) {}",
      "",
      'const fails = Effect.fail(new ProbeError({ message: "boom" }))',
      "const expectedPure: Effect.Effect<number> = fails",
      "",
      "void expectedPure",
      ""
    ].join("\n")
  )

  fs.writeFileSync(
    path.join(probeDir, "oxlint-probe.ts"),
    [
      'console.log(process.env.EFFECT_BASE_PROBE)',
      'JSON.parse("{}")',
      'fetch("https://example.invalid")',
      ""
    ].join("\n")
  )
}

const checkEffectDiagnosticProbes = () => {
  const result = run(
    "Effect diagnostic probe",
    "pnpm",
    [
      "exec",
      "effect-language-service",
      "diagnostics",
      "--project",
      path.join(".setup-probes", "tsconfig.json"),
      "--format",
      "json",
      "--strict"
    ],
    { allowFailure: true }
  )
  const payload = parseJsonOutput("Effect diagnostic probe", result.stdout)
  const names = new Set(payload.diagnostics.map((diagnostic) => diagnostic.name))
  const missing = requiredEffectDiagnostics.filter((name) => !names.has(name))

  assert(result.status !== 0, "Effect diagnostic probe unexpectedly passed.")
  assert(missing.length === 0, `Effect diagnostic probe did not fire: ${missing.join(", ")}.`)
  pass(`Effect diagnostic probes fired: ${requiredEffectDiagnostics.join(", ")}`)
}

const checkOxlintProbes = () => {
  const result = run(
    "oxlint raw API probe",
    "pnpm",
    [
      "exec",
      "oxlint",
      "-c",
      ".oxlintrc.json",
      path.join(".setup-probes", "oxlint-probe.ts")
    ],
    { allowFailure: true }
  )
  const output = `${result.stdout}\n${result.stderr}`
  const missing = requiredOxlintRules.filter((rule) => !output.includes(rule))

  assert(result.status !== 0, "oxlint raw API probe unexpectedly passed.")
  assert(missing.length === 0, `oxlint raw API probe did not fire: ${missing.join(", ")}.`)
  pass(`oxlint raw API probes fired: ${requiredOxlintRules.join(", ")}`)
}

try {
  console.log("Effect agent setup verification")
  checkStaticConfig()
  checkReferenceClone()
  checkNoReferenceImports()
  checkNoRemovedReferences()
  checkPatchedTypeScript()
  checkProjectClean()
  writeProbeProject()
  checkEffectDiagnosticProbes()
  checkOxlintProbes()
  writeSetupReceipt()
} finally {
  fs.rmSync(probeDir, { recursive: true, force: true })
}
