# Phase 1.1 Spec: Metadata Layers

## Summary

Phase 1.1 adds a new contribution workflow to the current SRJ package model:

- a logged-in session user can open an existing SRJ package
- choose one or more files in that package
- add a structured metadata layer to those files
- save that layer as a separate persistent entity

The original package, original file manifests, and original embedded file metadata remain unchanged. Phase 1.1 introduces additive contribution records, not full derivative package branching.

This keeps Phase 1 stable while allowing SRJ to begin modeling relational contribution.

## Product Goal

Allow a package recipient or package owner to add a governed metadata layer to files in an SRJ package without changing the original package itself.

## Why This Exists

Phase 1 currently supports:

- SRJ-root key creation
- package creation
- package unlocking through SRJ-access keys
- owner package retrieval and deletion
- embedded file manifests
- acceptance/access logging

What it does not yet support is user contribution after unlock. Metadata layers are the smallest next step toward relational stewardship because they:

- preserve the source package
- preserve embedded provenance
- avoid immediate co-ownership complexity
- allow translations, annotations, summaries, and contextual notes to be recorded
- link contributions to the contributor's SRJ-root key session

## Scope

Phase 1.1 includes:

- a new `Add metadata layer` action on unlocked package views
- a metadata-layer entry screen
- dropdown-based layer type selection
- file selection within the current package
- storage of metadata layers as separate logs/entities
- linkage from each metadata layer to the contributor's root-access record
- display of saved metadata layers on the package/file view

Phase 1.1 does not include:

- creation of full derivative packages
- branch/merge logic
- package re-sharing from metadata layers
- co-ownership percentages
- automatic rights inheritance resolution
- modification of original embedded file manifests

## User Roles

### Owner

A user with the SRJ-root key associated with the package owner record.

### Recipient

A user who unlocked a package through the package SRJ-access key and accepted terms.

### Contributor

Any logged-in session user who adds a metadata layer. In Phase 1.1, contributor is an activity role, not a legal ownership role.

## Core User Story

As a logged-in SRJ user who has opened a package, I want to add a metadata layer to one or more files so that my contribution is recorded without changing the original package.

## UI Entry Point

### Open Package Page

On the unlocked package page, add a new action in the existing right-hand action panel below the download actions:

- `Add metadata layer`

Helper text:

- `Add translations, annotations, summaries, or contextual notes while preserving the original package.`

This action is visible to:

- package owners
- recipients who have unlocked the package

This action is not visible when:

- the package is still locked
- there is no active session

## New Screen

### Route

Suggested route:

- `/open/[packageId]/layers/new`

If route expansion is deferred, a modal is acceptable for early testing. A dedicated page is preferred for Phase 1.1 because the form will grow based on selected layer type.

### Page Sections

1. Package context
2. Contributor session preview
3. File selector
4. Layer type dropdown
5. Layer details form
6. Save action

## Layer Type Dropdown

The layer type selector should be a required dropdown with these initial options:

- Translation
- Annotation
- Summary
- Context note
- Rights note
- Cultural sensitivity note
- Educational note
- Transcription
- Other

These should be stored internally as normalized values:

- `translation`
- `annotation`
- `summary`
- `context-note`
- `rights-note`
- `cultural-sensitivity-note`
- `educational-note`
- `transcription`
- `other`

## Form Behavior

All layer types share a common base form.

### Base Fields

- `layerTitle`
- `layerType`
- `targetFileIds[]`
- `language` optional unless required by type
- `description`
- `notes` optional

### Type-Specific Fields

#### Translation

- `targetLanguage`
- `translationScope`
- source link/upload area shown as under development

#### Annotation

- `annotationText`
- `fileRegionReference` optional

#### Summary

- `summaryText`
- `intendedAudience` optional

#### Rights Note

- `rightsNote`
- `rightsScope`

#### Context Note

- `contextText`

#### Cultural Sensitivity Note

- `sensitivityNote`
- `handlingGuidance`

#### Educational Note

- `teachingContext`

#### Transcription

- `transcriptionText`
- source link/upload area shown as under development

#### Other

- `customTypeLabel`
- `customContent`

## Data Model

Phase 1.1 introduces a new entity:

### Metadata Layer Log

Suggested TypeScript shape:

```ts
interface MetadataLayerLog {
  metadataLayerId: string;
  packageId: string;
  fileIds: string[];
  createdAt: string;
  createdBy: {
    rootKeyFileId: string | null;
    rootKeyValue?: string | null;
    name?: string | null;
    email?: string | null;
    organization?: string | null;
    keyType: "secure-key" | "access-key";
  };
  sourceAccess: {
    packageAcceptanceId?: string | null;
    accessorRootKey?: string | null;
  };
  layerType:
    | "translation"
    | "annotation"
    | "summary"
    | "context-note"
    | "rights-note"
    | "cultural-sensitivity-note"
    | "educational-note"
    | "transcription"
    | "other";
  layerTitle: string;
  language?: string | null;
  description: string;
  payload: Record<string, string | string[] | null>;
}
```

## Storage Model

Metadata layers should be stored as separate records, not appended into the package JSON and not embedded into the source files.

Suggested Blob path:

- `srj-demo/metadata-layer-logs/<packageId>/<metadataLayerId>.json`

This matches the current append-only, audit-friendly architecture.

## Linkage to Root-Access Records

Each metadata-layer log should link back to the contributor session using:

- `rootKeyFileId`
- `name`
- `email`
- `organization`
- `keyType`

If the session is a root-key session, the log should store the root-key file reference when available.

If the session is an access-key-only session, the log should still be allowed, but the `rootKeyFileId` can be null and the log should rely on acceptance-linked identity.

This preserves the distinction between:

- root-access identity
- package acceptance identity
- metadata-layer contribution

## Changes to Access Records

Current package access records only answer:

- who unlocked the package
- when they unlocked it

Phase 1.1 should keep those records intact and add a separate event reference model.

### Root-Key Text Log

No structural rewrite is required for existing root-key text files.

Add new access event entries only when a metadata layer is created:

```text
---
Event Type: created_metadata_layer
Created At: 2026-04-15T03:10:00.000Z
Package ID: srj_abc123
Metadata Layer ID: srjml_xyz789
Layer Type: translation
Target File IDs: file_a, file_b
Contributor Name: TP
Contributor Organization: 1/N
Contributor Email: tp@example.org
Accessor Root Key: 11 | no | 7+0
Geolocation: Tucson, AZ, US (32.1453, -110.9456)
```

This keeps the owner-facing access record understandable while adding a new event type.

### Acceptance Logs

Current acceptance logs can remain unchanged for Phase 1.1.

Optional future enhancement:

- include a pointer from metadata-layer logs to the acceptance log that made contribution possible

## Display Model

### Package View

Add a `Metadata layers` section below the file preview grid or as part of the file metadata area.

For each saved layer, show:

- layer type
- title
- contributor identity snapshot
- created at
- targeted file count

### File View

Each file card can later show:

- `Layers: 0`
- `Layers: 2`

Phase 1.1 can stop at package-level display if file-card display adds too much complexity.

## Permissions

A metadata layer can be created only when:

- a package is unlocked
- the user has an active session
- the user has accepted the package terms in the current unlock flow

This means the contributor must be either:

- the owner in a root-key session
- a recipient with a logged acceptance

### Lightweight Guard in Current Implementation

For the current local Phase 1.1 implementation, the save guard is intentionally lightweight:

- allow metadata-layer creation when the browser has an active package access cookie for that package
- allow metadata-layer creation when the request comes from the matching owner SRJ-root key session

This keeps the guard practical for Phase 1.1 while avoiding a larger authorization system.

## Validation Rules

- At least one file must be selected
- Layer type is required
- Layer title is required
- Description is required
- Type-specific required fields must be enforced
- Payload must be structured JSON server-side, not trusted directly from the client

## API Surface

Suggested endpoints:

- `POST /api/packages/[packageId]/metadata-layers`
- `GET /api/packages/[packageId]/metadata-layers`

### POST Request

Creates a new metadata layer log.

### GET Request

Returns metadata layers for display on the package page.

## Local Testing Targets

Phase 1.1 is ready for local testing when all of these work:

1. Owner unlocks a package and sees `Add metadata layer`.
2. Recipient unlocks a package and sees `Add metadata layer`.
3. User opens the metadata-layer form page.
4. User selects files and chooses a layer type from the dropdown.
5. User saves the layer.
6. A metadata-layer JSON record is written to Blob.
7. The owner root-key text file receives a `created_metadata_layer` event entry.
8. The package view shows the saved metadata layer.

## Non-Goals

Phase 1.1 intentionally does not solve:

- derivative package creation
- branch/merge UI
- lateral jump visualizations
- rights conflict resolution between contributors
- re-embedding the new metadata layer into downloaded files

## Current Limitations

- Metadata-layer authorization is cookie/session-based for recipients and owner-root-key-match based for owners. It is not yet a full contribution-permission graph.
- Recipient contribution identity is hydrated from the latest package acceptance log when the browser still has the package access cookie.
- Cross-domain sessions remain separate because browser session state and cookies are origin-scoped.
- A metadata layer is a separate persistent log entity and is not yet embedded back into downloaded derivative files.
- Metadata layers do not yet generate derivative packages, sibling branches, or lateral relational jumps.
- Translation and transcription layers currently show an inactive source link/upload control for demo clarity. Phase 2 can support linking an existing file in the package, or uploading and appending a new file into the package.

Those belong to a future relational package phase.

## Future Path

Metadata layers are designed to become the substrate for future derivative package behavior.

Possible later progression:

- Phase 2: promote one or more metadata layers into a derivative package
- Phase 2: relate packages as roots, sibling branches, and lateral jumps
- Phase 2: add governance-aware merge or local-root behavior
