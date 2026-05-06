export default {
  eleventyComputed: {
    title: (data) => data.folder?.title || "My Documents"
  }
};
