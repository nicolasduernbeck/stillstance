# Security Policy

## Supported versions

Only the latest release is supported with security updates.

## Reporting a vulnerability

Please report vulnerabilities privately via **GitHub's private vulnerability reporting** on this repository (Security → Report a vulnerability). Do not open a public issue for security problems.

You can expect an initial response within 14 days. Please allow up to 90 days for a fix before public disclosure.

## Scope notes

STILLSTANCE is a fully static, client-side PWA:

- It has no backend, no accounts, and no data collection.
- It makes zero external network requests at runtime; all assets are bundled.
- Settings are stored only in the browser's `localStorage`.

Relevant security surface is therefore limited to the client code itself, the build/dependency chain, and the reference nginx deployment configuration (`nginx.conf`, `Dockerfile`, `compose.yaml`). Reports in any of these areas are welcome.
