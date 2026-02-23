import { getPool } from '../db/db.js';

// Get all blog posts with pagination and filtering
export const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      featured, 
      search 
    } = req.query;

    const pool = getPool();
    let whereConditions = ['published = true'];
    let queryParams = [];
    let paramIndex = 1;
    
    if (category && category !== 'All') {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    if (featured) {
      whereConditions.push(`featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`(
        title ILIKE $${paramIndex} OR 
        excerpt ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(tags)
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get posts (excluding content for listing)
    const postsQuery = `
      SELECT id, title, slug, excerpt, author_name, author_bio, category, tags, 
             featured, published_at, read_time, views, likes
      FROM blog_posts 
      ${whereClause}
      ORDER BY published_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM blog_posts ${whereClause}`;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset

    const [postsResult, countResult] = await Promise.all([
      pool.query(postsQuery, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const posts = postsResult.rows.map(row => ({
      _id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      author: {
        name: row.author_name,
        bio: row.author_bio
      },
      category: row.category,
      tags: row.tags || [],
      featured: row.featured,
      publishedAt: row.published_at,
      readTime: row.read_time,
      views: row.views,
      likes: row.likes
    }));

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
};

// Get single blog post by slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = getPool();
    
    const postQuery = `
      SELECT id, title, slug, excerpt, content, author_name, author_bio, author_avatar,
             category, tags, featured, published_at, read_time, views, likes
      FROM blog_posts 
      WHERE slug = $1 AND published = true
    `;
    
    const postResult = await pool.query(postQuery, [slug]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    const row = postResult.rows[0];
    const post = {
      _id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      author: {
        name: row.author_name,
        bio: row.author_bio,
        avatar: row.author_avatar
      },
      category: row.category,
      tags: row.tags || [],
      featured: row.featured,
      publishedAt: row.published_at,
      readTime: row.read_time,
      views: row.views,
      likes: row.likes
    };

    // Increment view count
    await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [row.id]);

    // Get related posts (same category, excluding current post)
    const relatedQuery = `
      SELECT id, title, slug, excerpt, category, published_at, read_time
      FROM blog_posts
      WHERE category = $1 AND id != $2 AND published = true
      ORDER BY published_at DESC
      LIMIT 3
    `;
    
    const relatedResult = await pool.query(relatedQuery, [row.category, row.id]);
    const relatedPosts = relatedResult.rows.map(relatedRow => ({
      _id: relatedRow.id,
      title: relatedRow.title,
      slug: relatedRow.slug,
      excerpt: relatedRow.excerpt,
      category: relatedRow.category,
      publishedAt: relatedRow.published_at,
      readTime: relatedRow.read_time
    }));

    res.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
};

// Get featured posts
export const getFeaturedPosts = async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT id, title, slug, excerpt, author_name, author_bio, category, tags,
             featured, published_at, read_time, views
      FROM blog_posts 
      WHERE featured = true AND published = true
      ORDER BY published_at DESC 
      LIMIT 4
    `;
    
    const result = await pool.query(query);
    const posts = result.rows.map(row => ({
      _id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      author: {
        name: row.author_name,
        bio: row.author_bio
      },
      category: row.category,
      tags: row.tags || [],
      featured: row.featured,
      publishedAt: row.published_at,
      readTime: row.read_time,
      views: row.views
    }));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get featured posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured posts'
    });
  }
};

// Get categories with post counts
export const getCategories = async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT category, COUNT(*) as count
      FROM blog_posts 
      WHERE published = true
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    const categories = result.rows.map(row => ({
      name: row.category,
      count: parseInt(row.count)
    }));

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

// Get popular posts (by views)
export const getPopularPosts = async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT id, title, slug, views, read_time
      FROM blog_posts 
      WHERE published = true
      ORDER BY views DESC 
      LIMIT 5
    `;
    
    const result = await pool.query(query);
    const posts = result.rows.map(row => ({
      _id: row.id,
      title: row.title,
      slug: row.slug,
      views: row.views,
      readTime: row.read_time
    }));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get popular posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular posts'
    });
  }
};