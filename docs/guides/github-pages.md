# Static GitHub Pages hosting

The current Pages source is **master, repository root**. The root `.nojekyll`
marker makes this a plain static deployment: no theme, Liquid processing or Jekyll
exclusion rules may transform or omit engine modules. `_config.yml` is legacy
Jekyll metadata and is not used for this static site.

Keep the exact tracked path `src/core/Window/GameViewport.js`. It is exported by
`src/core/index.js` using a relative import. Example import maps resolve public
entry points relative to their own HTML document, preserving `/GameForgeJS/`.
Do not replace these with domain-root `/src/` paths or configure an HTML fallback
for missing JavaScript files.

After deployment, run:

```sh
node scripts/check-pages.cjs https://drakopit.github.io/GameForgeJS/
```

The audit follows the actual public runtime import graph, checks every response
for HTTP 200 and JavaScript MIME, parses it as an ES module, rejects external
runtime imports and verifies that dependencies stay under the hosted subpath.
It also works against a local prefix-hosted server. A missing module must remain a
404; returning the landing page for it hides the deployment error.

On 20 November 2026 the reported URL returned HTTP 200 and
`application/javascript; charset=utf-8` during investigation. The file was tracked
with the correct casing and Pages pointed at the correct branch/folder. The
earlier HTML response could not be reproduced; it is not evidence of a wrong
source import. The static deployment marker removes the unnecessary generator
step, and the response audit detects missing/HTML modules in future releases.
If an old HTML 404 remains in a browser cache after a successful audit, reload
with cache disabled and verify the failing request's status and response body.
