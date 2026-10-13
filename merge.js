/* merge.js - crop + rotate invoices, stamp order numbers, interleave with labels.
   Pure logic (needs the global PDFLib from pdf-lib). Works in browser and Node. */
(function (root) {
  const DEFAULTS = {
    // Crop box on the ORIGINAL invoice page (A4 595x842 pt), origin = top-left
    crop: { x0: 30, y0: 12, x1: 565, y1: 375 },
    rotate: 90,            // 90 = clockwise, 270 = counter-clockwise
    stamp: true,
    prefix: "Order-",
    start: 1,
    fontSize: 10,
    labelPos: { x: 10, y: 354 },    // baseline, origin top-left of the label page
    invoicePos: { x: 47, y: 26 },   // baseline, origin top-left of the ORIGINAL invoice page
  };

  async function mergeLabelsInvoices(invBytes, labBytes, userOpts) {
    const PL = root.PDFLib;
    const { PDFDocument, StandardFonts, rgb, degrees } = PL;
    const o = { ...DEFAULTS, ...(userOpts || {}) };
    o.crop = { ...DEFAULTS.crop, ...((userOpts && userOpts.crop) || {}) };

    const [inv, lab] = await Promise.all([
      PDFDocument.load(invBytes, { ignoreEncryption: true }),
      PDFDocument.load(labBytes, { ignoreEncryption: true }),
    ]);
    const out = await PDFDocument.create();
    const font = await out.embedFont(StandardFonts.Helvetica);

    const nI = inv.getPageCount(), nL = lab.getPageCount(), n = Math.min(nI, nL);
    const warning = nI !== nL
      ? `Page counts differ (labels=${nL}, invoices=${nI}). Paired ${n}; extras appended at the end.`
      : "";

    const { x0, y0, x1, y1 } = o.crop;
    const cw = x1 - x0, ch = y1 - y0;
    const label = (i) => `${o.prefix}${Number(o.start) + i}`;

    const labPages = await out.copyPages(lab, lab.getPageIndices());
    const invSrc = inv.getPages();
    const boxes = invSrc.map((p) => {
      const h = p.getHeight();
      return { left: x0, right: x1, top: h - y0, bottom: h - y1 };
    });
    const invEmb = await out.embedPages(invSrc, boxes);

    const addLabel = (i) => {
      const p = out.addPage(labPages[i]);
      if (o.stamp) p.drawText(label(i), { x: o.labelPos.x, y: p.getHeight() - o.labelPos.y,
        size: o.fontSize, font, color: rgb(0, 0, 0) });
    };
    const addInvoice = (i) => {
      const p = out.addPage([cw, ch]);
      p.drawPage(invEmb[i], { x: 0, y: 0 });                       // cropped content
      if (o.stamp) p.drawText(label(i), { x: o.invoicePos.x - x0, y: ch - (o.invoicePos.y - y0),
        size: o.fontSize, font, color: rgb(0, 0, 0) });
      p.setRotation(degrees(Number(o.rotate)));                    // rotate last
    };

    for (let i = 0; i < n; i++) { addLabel(i); addInvoice(i); }
    for (let i = n; i < nL; i++) addLabel(i);
    for (let i = n; i < nI; i++) addInvoice(i);

    return { bytes: await out.save(), pages: out.getPageCount(), warning };
  }

  root.mergeLabelsInvoices = mergeLabelsInvoices;
  root.MERGE_DEFAULTS = DEFAULTS;
})(typeof window !== "undefined" ? window : globalThis);
