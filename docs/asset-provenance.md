# Asset provenance

The original PromptCraft and campus-photo repositories are separate reference sources and have not been edited.

| Asset (legacy character rows retained as references) | Source |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `assets/backgrounds/classroom.png`        | Wider AI-edited classroom plate; see `classroom-image-prompt.md`         |
| `assets/characters/pixel/listening.png`   | Original `images/characters/professor-pixel/pp_07_listening_left_v4.png` |
| `assets/characters/pixel/thinking.png`    | Original `images/characters/professor-pixel/pp_02_thinking_v4.png`       |
| `assets/characters/pixel/encouraging.png` | Original `images/characters/professor-pixel/pp_04_encouraging_v4.png`    |
| `assets/characters/maya/neutral.png`      | Original `images/characters/students/maya/maya_01_neutral.png`           |
| `assets/characters/maya/confident.png`    | Original `images/characters/students/maya/maya_05_confident.png`         |
| `assets/brand/babbage-mark.svg`           | Original `images/ui/ui_01_babbage_mark.svg`                              |
| `favicon.ico`                             | Original P626 icon retained in P628                                      |

The classroom revision used the previous classroom plate as an edit target and campus `16-study-lounge.jpg` as a furniture proportion reference. Earlier unused classroom copies were removed from this working repository during cleanup. Original source images remain in their source repositories.

The active realistic Maya and Pixel portraits are the twenty supplied files listed in [the inspected artwork inventory](characters/artwork-integration.md). They replace the legacy character illustrations in the interface. Legacy images are inactive references and may be archived outside the current checkout; they are not rendered. The supplied [character guide](characters/guide.md) defines the current identities; the shared catalog prevents assigning one character's artwork to the other.

Lemonade diagrams and the loading engine are code-native SVG illustrations. Their text and teaching content stay accessible in the HTML interface. The brand emblem is unchanged.

The current module includes live Babbage clarification and optional suggestions through the existing Netlify backend, local approval, offline guide export, and Professor Pixel's recap. Research recording and publishing are not implemented.

The owner supplied `assets/people/babbage-engine.png` on October 21, 2026 as the updated engine artwork. It replaces the earlier engine photograph on information topics. Display-only framing accommodates its transparent margins; the source PNG is unchanged.

The built-in image_gen tool produced `assets/people/babbage-engine-repaired.png` from the supplied engine to complete the missing wooden corner. The original is retained as a reference. See [repair prompt and provenance](engine-corner-repair.md). Information topics now use the repaired PNG.
