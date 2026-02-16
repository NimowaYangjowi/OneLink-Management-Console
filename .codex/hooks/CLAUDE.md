# .codex/hooks Folder Guide

This folder contains hook entrypoints for Codex bridge workflows.

## Purpose

- Provide hook wrappers that allow Codex sessions to execute Claude-style project hooks.

## Contents

- `on-stop.sh` - invokes `.claude/hooks/auto-commit.sh` safely from Codex.
