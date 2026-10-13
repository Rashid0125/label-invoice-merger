# Label + Invoice Merger

Browser-based tool that crops and rotates invoice PDFs, stamps `Order-N` on every page, and interleaves them with labels (Label 1, Invoice 1, Label 2, Invoice 2, …). Runs 100% client-side, so it works on free GitHub Pages and your PDFs never leave the browser.

## Files

```
index.html   # UI
merge.js     # PDF logic (uses pdf-lib)
README.md
```

## Deploy on GitHub Pages (free)

1. **Create a repo** on github.com, e.g. `label-invoice-merger` (Public; Pages is free for public repos).
2. **Upload the files**: either drag `index.html`, `merge.js`, `README.md` into the repo via *Add file → Upload files*, or use git:
   ```bash
   git init
   git add index.html merge.js README.md
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/label-invoice-merger.git
   git push -u origin main
   ```
3. **Enable Pages**: repo → *Settings → Pages → Build and deployment*. Set *Source* to **Deploy from a branch**, *Branch* to **main**, folder **/ (root)**, then Save.
4. **Wait ~1 minute**, then open `https://<your-username>.github.io/label-invoice-merger/`.
5. **Update later**: commit changes to `main` and the site redeploys automatically.

## Test locally

```bash
python -m http.server 8000   # then open http://localhost:8000
```

## Tuning

Crop box, rotation, font size and stamp positions are defaults at the top of `merge.js` (`DEFAULTS`). Crop and rotation can also be changed live under *Advanced settings* on the page. Crop values are in PDF points on the original 595×842 invoice page, measured from the top-left.

## Notes

- Loads `pdf-lib` from the jsDelivr CDN. To work offline, download `pdf-lib.min.js` into the repo and change the `<script src>` in `index.html`.
- Private repo + Pages requires a paid GitHub plan; keep the repo public (it contains no customer data).
