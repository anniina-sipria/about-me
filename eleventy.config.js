export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "node_modules/xp.css/dist": "assets/xp" });
  eleventyConfig.addPassthroughCopy({ "bg-image.jpg": "assets/bg-image.jpg" });
  eleventyConfig.addPassthroughCopy({ "toolbar.jpeg": "assets/toolbar.jpeg" });
  eleventyConfig.addPassthroughCopy({ "wordpad-toolbar.png": "assets/wordpad-toolbar.png" });

  eleventyConfig.addFilter("htmlDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  });

  eleventyConfig.addCollection("projects", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/projects/*.md")
      .sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
  });

  eleventyConfig.addCollection("documents", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/documents/**/*.md")
      .sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
  });

  eleventyConfig.addCollection("documentFolders", (collectionApi) => {
    const docs = collectionApi
      .getFilteredByGlob("src/content/documents/**/*.md")
      .sort((a, b) => (b.date ?? 0) - (a.date ?? 0));

    function deriveFolderSlug(filePathStem) {
      const parts = String(filePathStem || "")
        .split("/")
        .filter(Boolean);
      const documentsIndex = parts.indexOf("documents");
      if (documentsIndex === -1) return "documents";
      const after = parts.slice(documentsIndex + 1);
      if (after.length <= 1) return "documents";
      return after[0];
    }

    function titleFromSlug(slug) {
      const text = String(slug || "").replace(/[-_]+/g, " ").trim();
      if (!text) return "Documents";
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    const folders = new Map();

    for (const doc of docs) {
      const slug = doc.data?.docFolderSlug || deriveFolderSlug(doc.filePathStem);
      const title = doc.data?.docFolderTitle || titleFromSlug(slug);
      if (!folders.has(slug)) {
        folders.set(slug, {
          slug,
          title,
          explorerPath: `C:\\My Documents\\${title}`,
          docs: []
        });
      }
      folders.get(slug).docs.push(doc);
    }

    return Array.from(folders.values()).sort((a, b) => a.title.localeCompare(b.title));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"]
  };
}
