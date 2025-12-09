# Architecture Changes - Modular Package Structure

## Summary

Changed from a single CLI package to a modular monorepo structure with separate packages for better user experience and maintainability.

## Before (Original Design)

- Single package: `uepm`
- Users install globally or run via `npx uepm init`
- Validation hook bundled with CLI tool
- Heavier download for one-time operations

## After (Current Implementation)

- Monorepo with 5 packages:
  - `@uepm/core` - Shared utilities
  - `@uepm/init` - One-time initialization (npx only)
  - `@uepm/validate` - Lightweight validation hook
  - `@uepm/example-plugin` - Example plugin
  - `@uepm/dependency-plugin` - Dependency example

## Key Benefits

1. **Lightweight**: Users run `npx @uepm/init` once without permanent installation
2. **Minimal footprint**: `@uepm/validate` is small, only installed as devDependency
3. **Modular**: Each package can be versioned and published independently
4. **Maintainable**: Shared code in `@uepm/core` avoids duplication
5. **Extensible**: Easy to add new packages (e.g., `@uepm/search`)

## User Workflow

```bash
# 1. Initialize project (once, via npx - no install)
npx @uepm/init

# 2. Install plugins (validate runs automatically)
npm install @uepm/example-plugin
```

## What Changed in Design Document

- Updated Overview section to describe modular structure
- Updated Architecture diagram to show separate packages
- Added Package Architecture section explaining each package
- Updated package.json examples to include @uepm/validate as devDependency
- Updated Implementation Notes to reflect monorepo structure
- Removed references to single CLI package

## What Stayed the Same

- All requirements remain valid (they describe *what*, not *how*)
- All correctness properties remain valid
- Testing strategy remains the same
- Error handling approach unchanged
- File formats and data models unchanged