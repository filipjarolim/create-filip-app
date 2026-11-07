# Starter feedback

When a bug or a missing piece shows up in an app cloned from this starter, and it belongs to the shared shell, fix it in this repo in the same change. Add one row here. Product screens, copy, and branding stay in the derived app.

The starter checkout is `~/Developer/create-filip-app`. If the current workspace is a clone, patch the same files there when that directory exists.

| Date | Area | What broke | Fix |
| --- | --- | --- | --- |
| 2026-11-07 | Map | The map was a Yandex static image, so labels were Cyrillic and it could not be dragged. CARTO raster tiles now require an API key. | Interactive OpenStreetMap tiles with drag and scroll zoom |
| 2026-11-07 | Theme | A refresh with Light selected left the web tab bar on the OS dark scheme | The bar reads the stored preference and does not use BlurView on web |
| 2026-11-07 | Switch | The native switch did not match the rest of the UI | Custom track and thumb |
| 2026-11-07 | Assistant | The model only saw the latest sentence and could not be stopped | The client and `ai-complete` send the recent turns, and the screen can stop or clear |
