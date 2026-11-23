# Live visual review — November 23, 2026

Reviewed the live preview in the user's narrow in-app browser, including Home, About, Course Guide, Idea Lab, the guided dialogue and smartboard, and Creative Workspace. The review exposed defects that geometry-only checks had accepted: inconsistent guide-library gutters, a large outline around a programmatically focused heading, nested Idea Lab scroll areas, and obsolete space reserved below story navigation. The Netlify collaboration toolbar also overlays the preview's bottom controls; that toolbar belongs to the hosting preview, not the application.

Corrected the shared editorial styles: align guide introduction, empty state, and notes; remove the guide entries' leftover tinted background; let the library use natural document flow; remove outlines from non-interactive page titles while retaining interactive control focus; let Idea Lab content scroll with the page; remove the obsolete story bottom padding and extend scenes to the available viewport height. Update the empty guide's navigation wording to match the public Home navigation.

The six-size visual inventory contains 774 captures with no reported layout, text-size, contrast, or framed-surface failures. Final focused checks cover story replay/narration controls, both design journeys, completion, every guide preview section, real HTML and Canvas CSV downloads, offline phone guides, and saved-work preservation. Browser speech and AI checks use fixtures. The final scene/library refinements receive those focused checks after the full inventory.

All work remains on the preview branch. PR #4 was already merged before this review; the corrections require a new unmerged preview request.
