export default {
  layout: "layouts/wordpad.njk",
  eleventyComputed: {
    docFolderSlug: (data) => {
      const stem = String(data.page?.filePathStem || "");
      const parts = stem.split("/").filter(Boolean);
      const documentsIndex = parts.indexOf("documents");
      if (documentsIndex === -1) return "documents";
      const after = parts.slice(documentsIndex + 1);
      if (after.length <= 1) return "documents";
      return after[0];
    },
    docFolderTitle: (data) => {
      const slug = data.docFolderSlug || "documents";
      const text = String(slug).replace(/[-_]+/g, " ").trim();
      if (!text) return "Documents";
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    permalink: (data) => {
      const folder = data.docFolderSlug || "documents";
      return `/my-documents/${folder}/${data.page.fileSlug}/`;
    }
  }
};
