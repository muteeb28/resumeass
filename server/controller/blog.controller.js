import BlogPost from "../model/blog.model.js";

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    const filters = { published: true };

    if (category && category !== "All") {
      filters.category = category;
    }

    if (featured !== undefined) {
      filters.featured = featured === "true";
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filters.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(filters)
        .select("title slug excerpt author category tags featured publishedAt readTime views likes")
        .sort({ publishedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blog posts",
    });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, published: true }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      });
    }

    await BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } });

    const relatedPosts = await BlogPost.find({
      category: post.category,
      _id: { $ne: post._id },
      published: true,
    })
      .select("title slug excerpt category publishedAt readTime")
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          views: (post.views || 0) + 1,
        },
        relatedPosts,
      },
    });
  } catch (error) {
    console.error("Get post by slug error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blog post",
    });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ featured: true, published: true })
      .select("title slug excerpt author category tags featured publishedAt readTime views")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Get featured posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured posts",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { published: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

export const getPopularPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true })
      .select("title slug views readTime")
      .sort({ views: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Get popular posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch popular posts",
    });
  }
};
