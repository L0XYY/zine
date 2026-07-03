# Brand assets — drop-in files

The **favicon** (`src/app/icon.svg`) and the **in-app logo** (`src/components/ui/Logo.tsx`)
are already on-brand as scalable SVG — nothing to add for those.

Add these two raster files here in `public/` when you have them:

| File                    | Used for                                  | Recommended size        |
| ----------------------- | ----------------------------------------- | ----------------------- |
| `banner.png`            | Social share / Open Graph preview image   | 2000×600 (or 1200×630)  |
| `apple-icon.png`        | iOS home-screen icon (optional)           | 180×180                 |

- `banner.png` is already referenced by the Open Graph + Twitter card metadata in
  `src/app/layout.tsx`. Once the file exists here it shows up in link previews.
- For the iOS icon, drop `apple-icon.png` into `src/app/` (not `public/`) and Next
  will wire it automatically — or leave it; the SVG favicon covers most cases.

Your uploaded logo icon and banner map directly to `apple-icon.png` and
`banner.png` respectively.
