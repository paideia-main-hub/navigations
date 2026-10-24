# Coordinator Teams page — create/edit popup (design)

**Date:** 2026-10-24  
**Status:** Approved  
**Choice:** Option A — school-wide (no competition picker)

## Summary

- **Create team** opens a modal (not an on-page form), matching registration Add team chrome (`StudentMultiSelect`, Add student, Cancel/Save).
- **Edit** on each team card opens the same modal, prefilled.
- Rules: at least 2 members; no competition size/grade caps.
- Actions: existing `createTeam` / `updateSchoolTeamAction` (no competition ids for school-wide create).
