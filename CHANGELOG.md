# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Timer is now a repeating countdown cycle (GET READY → HOLD → NEXT POSITION → …) with configurable hold duration (15–120 s) and transition time (0–30 s), replacing the open-ended count-up timer and milestone cues

## [0.1.0] - 2026-08-30

### Added

- Open-ended count-up stretch timer with timestamp-based accuracy
- Configurable preparation countdown (0/3/5/10 s) with automatic start
- Pause, resume, stop, and repeat
- Optional milestone feedback at 30/60/90/120 s
- Optional vibration and Web Audio generated sounds
- Screen Wake Lock with progressive enhancement
- Installable, fully offline PWA (zero external requests)
- Local settings persistence
- Docker deployment with unprivileged nginx and strict security headers
