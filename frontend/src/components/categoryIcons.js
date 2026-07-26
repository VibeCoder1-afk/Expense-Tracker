export const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Rent: "🏠",
  Utilities: "💡",
  Entertainment: "🎬",
  Health: "💊",
  Shopping: "🛍️",
  Other: "📦",
};

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || "📦";
