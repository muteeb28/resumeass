import crypto from "crypto";
import Portfolio from "../model/portfolio.model.js";

function generateSlug(name) {
  const base = (name || "portfolio")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}

export const savePortfolio = async (req, res) => {
  try {
    const { data, theme } = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Resume data is required" });
    }

    const name = data.basics?.name || "portfolio";
    const slug = generateSlug(name);

    await Portfolio.create({
      slug,
      data,
      theme: theme || "default",
      published: true,
    });

    res.json({
      success: true,
      url: `/p/${slug}`,
      slug,
    });
  } catch (error) {
    console.error("Error saving portfolio:", error.message);
    res.status(500).json({ message: "Failed to save portfolio" });
  }
};

export const getPortfolio = async (req, res) => {
  try {
    const { username: slug } = req.params;

    const portfolio = await Portfolio.findOne({ slug, published: true })
      .select("data theme slug")
      .lean();

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json({
      data: portfolio.data,
      theme: portfolio.theme,
      slug: portfolio.slug,
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error.message);
    res.status(500).json({ message: "Failed to load portfolio" });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    await Portfolio.deleteOne({ slug });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio:", error.message);
    res.status(500).json({ message: "Failed to delete portfolio" });
  }
};
