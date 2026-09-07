# September 2026 dependency security audit

Checked the 48 open Dependabot alerts from pacphi/slappy against the regenerated pnpm 12 lockfile on 2026-09-07. The table checks every resolved version against GitHub's affected range, including transitive and development dependencies. A clear result describes this branch; GitHub's default-branch alerts remain open until the fix is merged and rescanned.

The npm audit also reports zero vulnerabilities at every severity. Updates use current compatible releases, with a scoped fontless → esbuild override to resolve the Windows development-server traversal advisory. Previous open-ended overrides are bounded to their intended major versions; the unhead override was removed so Nuxt can select compatible dependencies.

## Exposure and resolution

Nuxt and its runtime dependencies ship with the server, so their XSS, SSR data exposure, island rendering, request processing, and denial-of-service advisories were treated as potentially relevant without relying on feature-level workarounds. Nuxt UI and editor dependencies are bundled by the UI package; upgrading removes the affected versions even where Slappy does not instantiate the affected widgets. Build and development tooling (Babel, Browserslist, PostCSS, YAML, esbuild, Vite, DevTools, shell-quote, and filesystem/archive helpers) also receive patched versions. Slappy does not expose the esbuild development server in production, but the Windows-only advisory was fixed for local development too. No vulnerability was dismissed based solely on being transitive or development-only.

## Advisory evidence

Each link is the upstream GitHub advisory consulted for affected and patched versions. No advisories are deferred.

| Alert | Package                 | Severity | Advisory                                                                 | First patch in alert | Resolved versions | Range check |
| ----- | ----------------------- | -------- | ------------------------------------------------------------------------ | -------------------- | ----------------- | ----------- |
| 154   | browserslist            | high     | [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | 4.28.7               | 4.28.9            | Clear       |
| 153   | browserslist            | high     | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | 4.28.7               | 4.28.9            | Clear       |
| 152   | nanoid                  | high     | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | 3.3.12               | 3.3.18, 5.1.16    | Clear       |
| 151   | @humanfs/node           | medium   | [GHSA-p498-v437-472g](https://github.com/advisories/GHSA-p498-v437-472g) | 0.16.8               | 0.16.8            | Clear       |
| 150   | @tiptap/core            | medium   | [GHSA-cp6q-959q-f8rh](https://github.com/advisories/GHSA-cp6q-959q-f8rh) | 3.30.4               | 3.31.3            | Clear       |
| 149   | nanoid                  | high     | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | 5.1.11               | 3.3.18, 5.1.16    | Clear       |
| 148   | postcss-selector-parser | low      | [GHSA-w9m9-85wc-3x92](https://github.com/advisories/GHSA-w9m9-85wc-3x92) | 7.1.3                | 7.1.6             | Clear       |
| 147   | nanoid                  | high     | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | 3.3.18               | 3.3.18, 5.1.16    | Clear       |
| 146   | postcss                 | medium   | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | 8.5.23               | 8.5.28            | Clear       |
| 145   | nanoid                  | high     | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | 3.3.16               | 3.3.18, 5.1.16    | Clear       |
| 143   | js-yaml                 | high     | [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | 4.3.1                | 4.3.2             | Clear       |
| 140   | nanoid                  | high     | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | 5.1.16               | 3.3.18, 5.1.16    | Clear       |
| 139   | @nuxt/devtools          | critical | [GHSA-279x-mwfv-vcqv](https://github.com/advisories/GHSA-279x-mwfv-vcqv) | 3.3.1                | 3.4.2             | Clear       |
| 138   | nuxt                    | high     | [GHSA-9pgf-384g-p7mv](https://github.com/advisories/GHSA-9pgf-384g-p7mv) | 4.5.1                | 4.5.2             | Clear       |
| 137   | nuxt                    | high     | [GHSA-9473-5f9j-94wq](https://github.com/advisories/GHSA-9473-5f9j-94wq) | 4.5.1                | 4.5.2             | Clear       |
| 136   | nuxt                    | medium   | [GHSA-48hr-524c-v5w3](https://github.com/advisories/GHSA-48hr-524c-v5w3) | 4.5.1                | 4.5.2             | Clear       |
| 135   | nuxt                    | high     | [GHSA-wm8w-6qjm-cv43](https://github.com/advisories/GHSA-wm8w-6qjm-cv43) | 4.5.1                | 4.5.2             | Clear       |
| 134   | nuxt                    | high     | [GHSA-hxcr-hm88-mpq6](https://github.com/advisories/GHSA-hxcr-hm88-mpq6) | 4.5.1                | 4.5.2             | Clear       |
| 133   | @nuxt/ui                | medium   | [GHSA-gj2h-2fpw-fhv9](https://github.com/advisories/GHSA-gj2h-2fpw-fhv9) | 4.8.1                | 4.11.1            | Clear       |
| 132   | brace-expansion         | high     | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | 5.0.9                | 2.1.4, 5.0.9      | Clear       |
| 131   | postcss                 | high     | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | 8.5.18               | 8.5.28            | Clear       |
| 130   | brace-expansion         | high     | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | 5.0.8                | 2.1.4, 5.0.9      | Clear       |
| 129   | tar                     | high     | [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m) | 7.5.21               | 7.5.22            | Clear       |
| 128   | valibot                 | medium   | [GHSA-5qjj-4xww-7phc](https://github.com/advisories/GHSA-5qjj-4xww-7phc) | 1.4.2                | Removed           | Clear       |
| 127   | js-yaml                 | high     | [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) | 4.3.0                | 4.3.2             | Clear       |
| 126   | tar                     | medium   | [GHSA-w8wr-v893-vjvp](https://github.com/advisories/GHSA-w8wr-v893-vjvp) | 7.5.18               | 7.5.22            | Clear       |
| 125   | tar                     | critical | [GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) | 7.5.19               | 7.5.22            | Clear       |
| 124   | tar                     | medium   | [GHSA-gvwx-54wh-qm9j](https://github.com/advisories/GHSA-gvwx-54wh-qm9j) | 7.5.17               | 7.5.22            | Clear       |
| 123   | tar                     | high     | [GHSA-8x88-c5mf-7j5w](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) | 7.5.18               | 7.5.22            | Clear       |
| 122   | sharp                   | high     | [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | 0.35.0               | 0.35.4            | Clear       |
| 121   | shell-quote             | high     | [GHSA-395f-4hp3-45gv](https://github.com/advisories/GHSA-395f-4hp3-45gv) | 1.9.0                | 1.10.0            | Clear       |
| 120   | svgo                    | high     | [GHSA-2p49-hgcm-8545](https://github.com/advisories/GHSA-2p49-hgcm-8545) | 4.0.2                | 4.1.0             | Clear       |
| 119   | brace-expansion         | high     | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | 5.0.7                | 2.1.4, 5.0.9      | Clear       |
| 118   | js-yaml                 | medium   | [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) | 4.2.0                | 4.3.2             | Clear       |
| 117   | @babel/core             | low      | [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) | 7.29.6               | 7.29.7            | Clear       |
| 115   | ws                      | high     | [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) | 8.21.0               | 8.21.3            | Clear       |
| 114   | tar                     | medium   | [GHSA-vmf3-w455-68vh](https://github.com/advisories/GHSA-vmf3-w455-68vh) | 7.5.16               | 7.5.22            | Clear       |
| 113   | vite                    | medium   | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | 7.3.5                | 8.2.2             | Clear       |
| 112   | nuxt                    | low      | [GHSA-m3q2-p4fw-w38m](https://github.com/advisories/GHSA-m3q2-p4fw-w38m) | 4.4.7                | 4.5.2             | Clear       |
| 111   | nuxt                    | medium   | [GHSA-934w-87qh-qr26](https://github.com/advisories/GHSA-934w-87qh-qr26) | 4.4.7                | 4.5.2             | Clear       |
| 110   | nuxt                    | medium   | [GHSA-534h-c3cw-v3h9](https://github.com/advisories/GHSA-534h-c3cw-v3h9) | 4.4.7                | 4.5.2             | Clear       |
| 109   | nuxt                    | high     | [GHSA-mm7m-92g8-7m47](https://github.com/advisories/GHSA-mm7m-92g8-7m47) | 4.4.7                | 4.5.2             | Clear       |
| 108   | nuxt                    | medium   | [GHSA-c9cv-mq2m-ppp3](https://github.com/advisories/GHSA-c9cv-mq2m-ppp3) | 4.4.7                | 4.5.2             | Clear       |
| 107   | vite                    | high     | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | 7.3.5                | 8.2.2             | Clear       |
| 106   | launch-editor           | medium   | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | 2.14.1               | 2.14.1            | Clear       |
| 105   | nuxt                    | low      | [GHSA-rq7w-g337-39qq](https://github.com/advisories/GHSA-rq7w-g337-39qq) | 4.4.7                | 4.5.2             | Clear       |
| 103   | esbuild                 | low      | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) | 0.28.1               | 0.28.2            | Clear       |
| 102   | shell-quote             | critical | [GHSA-w7jw-789q-3m8p](https://github.com/advisories/GHSA-w7jw-789q-3m8p) | 1.8.4                | 1.10.0            | Clear       |
