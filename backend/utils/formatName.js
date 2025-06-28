

export const formatName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-"); 
};