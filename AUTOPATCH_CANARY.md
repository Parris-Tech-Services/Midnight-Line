# AutoPatch isolated dependency canary

Date: 11 November 2026. Source baseline: `1c350723eb30447fb08ebda674cd1e12f63dd84c`.

This is a bounded repair of development/build dependencies, not a claim that the
static game's running backend was vulnerable or that production has been patched.
No existing deployment, domain, saved game, or production configuration is changed.

## Discovery and reproduction

Fresh `npm audit --json` identified six affected package nodes: esbuild, vite,
nanoid, postcss, rollup, source-map-js. That is not six distinct vulnerabilities.

The independent advisory describes esbuild's wildcard CORS response:
[GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99).
The committed test starts the actual installed esbuild on loopback, serving a
temporary, harmless canary file. It sends an unrelated Origin and checks headers.
It performs no requests against third-party systems and always cleans up.

Observed baseline: esbuild 0.21.5, HTTP 200, wildcard Allow-Origin, test exit 1.
Observed candidate: esbuild 0.25.12, HTTP 200, no Allow-Origin, test exit 0.
The unchanged regression SHA-256 is
`1561b73936d56c31b4562e902aa1b15164f4983fefc537f4725e0b98a247f47a`.

## Repair scope

Vite 5.4.21 becomes 6.4.6, with compatible transitive dependency refreshes.
Production dependency names and exact versions remain unchanged.
All application source files remain unchanged. Dependency installation skips
third-party lifecycle scripts: `npm ci --ignore-scripts --no-audit --no-fund`.

Candidate build passed. Fresh candidate npm audit reported zero findings.
Zero means no findings in that registry response, not complete security coverage,
not an OSV no-record classification, and not proof of production remediation.

## Acceptance and remaining boundaries

- Run `npm run test:security`, production build, and the existing browser suite.
- Use the existing CI workflow, with lifecycle scripts disabled and the security
  test added before build. Do not weaken existing browser assertions.
- Deploy only a separate preview; verify its actual asset hashes and game flows.
- Preserve baseline evidence and output for rollback comparison.
- Do not merge or replace the original production origin automatically.
- Source repair discovery, independently administered signing keys, trusted
  deployment collectors, durable anti-replay state, and production rollback
  remain separate AutoPatch integration work.
- An agent-produced report is not trusted attestation. Do not mark the complete
  system VERIFIED_FIXED merely because these local checks pass.
