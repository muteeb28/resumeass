import db from "../db/db.js";
const { getPool } = db;
import crypto from "crypto";

/**
 * Generate a URL-safe slug from a name.
 * e.g. "Muteeb Masoodi" -> "muteeb-masoodi"
 * Appends a short random suffix to avoid collisions.
 */
function generateSlug(name) {
    const base = (name || "portfolio")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
    const suffix = crypto.randomBytes(3).toString("hex"); // 6 chars
    return `${base}-${suffix}`;
}

/**
 * POST /api/portfolio — Save portfolio (no auth required)
 * Generates a unique slug from the person's name.
 */
export const savePortfolio = async (req, res) => {
    try {
        const { data, theme } = req.body;

        if (!data || typeof data !== "object") {
            return res.status(400).json({ message: "Resume data is required" });
        }

        const name = data.basics?.name || "portfolio";
        const slug = generateSlug(name);

        await getPool().query(
            `INSERT INTO portfolios (slug, data, theme, published)
             VALUES ($1, $2, $3, true)`,
            [slug, JSON.stringify(data), theme || "default"]
        );

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

/**
 * GET /api/portfolio/:slug — Get public portfolio (no auth)
 */
export const getPortfolio = async (req, res) => {
    try {
        const { username: slug } = req.params;

        const { rows: [portfolio] } = await getPool().query(
            `SELECT data, theme, slug FROM portfolios WHERE slug = $1 AND published = true`,
            [slug]
        );

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

/**
 * DELETE /api/portfolio/:slug — Delete portfolio
 */
export const deletePortfolio = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        await getPool().query("DELETE FROM portfolios WHERE slug = $1", [slug]);

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting portfolio:", error.message);
        res.status(500).json({ message: "Failed to delete portfolio" });
    }
};
