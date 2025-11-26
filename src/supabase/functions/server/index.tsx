import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4d451974/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all movies
app.get("/make-server-4d451974/movies", async (c) => {
  try {
    console.log("Fetching movies from database...");
    const moviesData = await kv.getByPrefix("movie:");
    console.log("Raw data from getByPrefix:", JSON.stringify(moviesData));
    
    // getByPrefix returns an array of objects with key and value
    // We need to extract just the values
    const movies = Array.isArray(moviesData) ? moviesData.map(item => item.value || item) : [];
    
    console.log("Processed movies:", JSON.stringify(movies));
    return c.json({ success: true, movies });
  } catch (error) {
    console.log(`Error fetching movies: ${error}`);
    return c.json({ success: false, error: String(error), movies: [] }, 500);
  }
});

// Get single movie by ID
app.get("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const movie = await kv.get(`movie:${id}`);
    if (!movie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }
    return c.json({ success: true, movie });
  } catch (error) {
    console.log(`Error fetching movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new movie
app.post("/make-server-4d451974/movies", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, videoUrl, thumbnailUrl, genre, year, type, fileSize, category, ageRating, section, episodes, seriesTitle, seasonNumber, episodeNumber } = body;

    if (!title || !videoUrl) {
      return c.json({ success: false, error: "Title and video URL are required" }, 400);
    }

    // Generate unique ID based on timestamp
    const id = Date.now().toString();
    const movie = {
      id,
      title,
      description: description || "",
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      genre: genre || "General",
      year: year || new Date().getFullYear().toString(),
      type: type || "movie", // movie, series, documentary
      fileSize: fileSize || "",
      category: category || undefined,
      ageRating: ageRating || undefined,
      section: section || undefined,
      episodes: episodes || [], // For series: array of episodes
      // Series fields
      seriesTitle: seriesTitle || undefined,
      seasonNumber: seasonNumber || undefined,
      episodeNumber: episodeNumber || undefined,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    await kv.set(`movie:${id}`, movie);
    return c.json({ success: true, movie });
  } catch (error) {
    console.log(`Error adding movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update movie
app.put("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingMovie = await kv.get(`movie:${id}`);
    
    if (!existingMovie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }

    const body = await c.req.json();
    const updatedMovie = {
      ...existingMovie,
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`movie:${id}`, updatedMovie);
    return c.json({ success: true, movie: updatedMovie });
  } catch (error) {
    console.log(`Error updating movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete movie
app.delete("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`movie:${id}`);
    return c.json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.log(`Error deleting movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== AUTHENTICATION ROUTES =====

// Sign Up
app.post("/make-server-4d451974/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ success: false, error: "Email, password, and name are required" }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ success: false, error: error.message }, 400);
    }

    // Store user info in KV store
    const userId = data.user.id;
    const userRecord = {
      id: userId,
      email,
      name,
      isBlocked: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userRecord);

    // Sign in to get access token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log(`Auto sign-in error after signup: ${signInError.message}`);
      return c.json({ success: false, error: signInError.message }, 400);
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        accessToken: signInData.session.access_token,
      },
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Sign In
app.post("/make-server-4d451974/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400);
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Sign-in error: ${error.message}`);
      return c.json({ success: false, error: error.message }, 401);
    }

    const userId = data.user.id;

    // Get user record from KV store
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User record not found" }, 404);
    }

    // Check if user is blocked
    if (userRecord.isBlocked) {
      return c.json({ success: false, error: "Your account has been blocked by admin" }, 403);
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email: userRecord.email,
        name: userRecord.name,
        accessToken: data.session.access_token,
      },
    });
  } catch (error) {
    console.log(`Sign-in error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verify Password (for PIN reset security)
app.post("/make-server-4d451974/verify-password", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400);
    }

    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Password verification failed: ${error.message}`);
      return c.json({ success: false, verified: false, error: "Incorrect password" }, 401);
    }

    // Password is correct
    return c.json({
      success: true,
      verified: true,
      message: "Password verified successfully"
    });
  } catch (error) {
    console.log(`Password verification error: ${error}`);
    return c.json({ success: false, verified: false, error: String(error) }, 500);
  }
});

// Check Auth (verify token and get user)
app.get("/make-server-4d451974/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: "Invalid token" }, 401);
    }

    // Get user record
    const userRecord = await kv.get(`user:${user.id}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User record not found" }, 404);
    }

    // Check if blocked
    if (userRecord.isBlocked) {
      return c.json({ success: false, error: "Account blocked" }, 403);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: userRecord.email,
        name: userRecord.name,
      },
    });
  } catch (error) {
    console.log(`Auth check error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ADMIN USER MANAGEMENT ROUTES =====

// Get all users (admin only)
app.get("/make-server-4d451974/admin/users", async (c) => {
  try {
    console.log("Fetching all users from database...");
    const usersData = await kv.getByPrefix("user:");
    const users = Array.isArray(usersData) ? usersData.map(item => item.value || item) : [];
    
    console.log(`Found ${users.length} users`);
    return c.json({ success: true, users });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ success: false, error: String(error), users: [] }, 500);
  }
});

// Block user (admin only)
app.post("/make-server-4d451974/admin/users/:id/block", async (c) => {
  try {
    const userId = c.req.param("id");
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const updatedUser = {
      ...userRecord,
      isBlocked: true,
      blockedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);
    
    console.log(`User ${userId} (${userRecord.email}) has been blocked`);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error blocking user: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Unblock user (admin only)
app.post("/make-server-4d451974/admin/users/:id/unblock", async (c) => {
  try {
    const userId = c.req.param("id");
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const updatedUser = {
      ...userRecord,
      isBlocked: false,
      unblockedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);
    
    console.log(`User ${userId} (${userRecord.email}) has been unblocked`);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error unblocking user: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== BACKGROUND SETTINGS ROUTES =====

// Get background settings
app.get("/make-server-4d451974/admin/background", async (c) => {
  try {
    console.log("Fetching background settings...");
    const settingsData = await kv.get("settings:background");
    
    // Default settings
    const defaultSettings = {
      type: 'image',
      videoUrl: '',
      imageUrl: '',
    };
    
    if (!settingsData) {
      console.log("No settings found, returning defaults");
      return c.json({
        success: true,
        settings: defaultSettings,
      });
    }
    
    console.log("Settings found:", JSON.stringify(settingsData));
    return c.json({ 
      success: true, 
      settings: settingsData 
    });
  } catch (error) {
    console.log(`Error fetching background settings: ${error}`);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// Save background settings
app.post("/make-server-4d451974/admin/background", async (c) => {
  try {
    const body = await c.req.json();
    const { type, videoUrl, imageUrl } = body;
    
    console.log("Received background settings:", JSON.stringify(body));
    
    const settings = {
      type: type || 'image',
      videoUrl: videoUrl || '',
      imageUrl: imageUrl || '',
      updatedAt: new Date().toISOString(),
    };
    
    console.log("Saving settings:", JSON.stringify(settings));
    await kv.set("settings:background", settings);
    console.log("Background settings saved successfully");
    
    return c.json({ 
      success: true, 
      settings: settings 
    });
  } catch (error) {
    console.log(`Error saving background settings: ${error}`);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// ===== USER ACTIVITY TRACKING ROUTES =====

// Track user activity (watch, download)
app.post("/make-server-4d451974/activity/track", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: "Invalid token" }, 401);
    }

    const { movieId, action, movieTitle } = await c.req.json();

    if (!movieId || !action) {
      return c.json({ success: false, error: "Movie ID and action are required" }, 400);
    }

    // Create activity record
    const activityId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const activity = {
      id: activityId,
      userId: user.id,
      movieId,
      movieTitle: movieTitle || '',
      action, // 'watch' or 'download'
      timestamp: new Date().toISOString(),
    };

    // Save activity
    await kv.set(`activity:${user.id}:${activityId}`, activity);

    // Update movie stats
    const movie = await kv.get(`movie:${movieId}`);
    if (movie) {
      const updatedMovie = {
        ...movie,
        views: (movie.views || 0) + (action === 'watch' ? 1 : 0),
        downloads: (movie.downloads || 0) + (action === 'download' ? 1 : 0),
      };
      await kv.set(`movie:${movieId}`, updatedMovie);
    }

    // Update user stats
    const userStats = await kv.get(`user_stats:${user.id}`) || { 
      totalWatches: 0, 
      totalDownloads: 0,
      lastActive: null 
    };
    
    const updatedStats = {
      ...userStats,
      totalWatches: userStats.totalWatches + (action === 'watch' ? 1 : 0),
      totalDownloads: userStats.totalDownloads + (action === 'download' ? 1 : 0),
      lastActive: new Date().toISOString(),
    };
    
    await kv.set(`user_stats:${user.id}`, updatedStats);

    console.log(`Activity tracked: User ${user.id} ${action}ed movie ${movieId}`);
    
    return c.json({ success: true, activity });
  } catch (error) {
    console.log(`Error tracking activity: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user activity history (for a specific user)
app.get("/make-server-4d451974/admin/users/:id/activity", async (c) => {
  try {
    const userId = c.req.param("id");
    console.log(`Fetching activity for user: ${userId}`);
    
    const activitiesData = await kv.getByPrefix(`activity:${userId}:`);
    const activities = Array.isArray(activitiesData) ? activitiesData.map(item => item.value || item) : [];
    
    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Get user stats
    const userStats = await kv.get(`user_stats:${userId}`) || { 
      totalWatches: 0, 
      totalDownloads: 0,
      lastActive: null 
    };
    
    console.log(`Found ${activities.length} activities for user ${userId}`);
    return c.json({ 
      success: true, 
      activities,
      stats: userStats
    });
  } catch (error) {
    console.log(`Error fetching user activity: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get analytics report (all users overview)
app.get("/make-server-4d451974/admin/analytics/report", async (c) => {
  try {
    console.log("Generating analytics report...");
    
    // Get all users
    const usersData = await kv.getByPrefix("user:");
    const users = Array.isArray(usersData) ? usersData.map(item => item.value || item) : [];
    
    // Get all movies
    const moviesData = await kv.getByPrefix("movie:");
    const movies = Array.isArray(moviesData) ? moviesData.map(item => item.value || item) : [];
    
    // Get all activities
    const activitiesData = await kv.getByPrefix("activity:");
    const activities = Array.isArray(activitiesData) ? activitiesData.map(item => item.value || item) : [];
    
    // Calculate metrics
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalViews = activities.filter(a => a.action === 'watch').length;
    const totalDownloads = activities.filter(a => a.action === 'download').length;
    
    // Get top movies by activity
    const movieActivity = {};
    activities.forEach(activity => {
      if (!movieActivity[activity.movieId]) {
        movieActivity[activity.movieId] = { views: 0, downloads: 0 };
      }
      if (activity.action === 'watch') movieActivity[activity.movieId].views++;
      if (activity.action === 'download') movieActivity[activity.movieId].downloads++;
    });
    
    // Get top 10 movies
    const topMovies = Object.entries(movieActivity)
      .map(([movieId, stats]) => {
        const movie = movies.find(m => m.id === movieId);
        return {
          movieId,
          movieTitle: movie?.title || 'Unknown',
          views: stats.views,
          downloads: stats.downloads,
          totalActivity: stats.views + stats.downloads,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);
    
    // Get most active users
    const userActivity = {};
    activities.forEach(activity => {
      if (!userActivity[activity.userId]) {
        userActivity[activity.userId] = { watches: 0, downloads: 0 };
      }
      if (activity.action === 'watch') userActivity[activity.userId].watches++;
      if (activity.action === 'download') userActivity[activity.userId].downloads++;
    });
    
    const topUsers = Object.entries(userActivity)
      .map(([userId, stats]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          watches: stats.watches,
          downloads: stats.downloads,
          totalActivity: stats.watches + stats.downloads,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);
    
    // Recent activities (last 50)
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
      .map(activity => {
        const user = users.find(u => u.id === activity.userId);
        const movie = movies.find(m => m.id === activity.movieId);
        return {
          ...activity,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          movieTitle: movie?.title || activity.movieTitle || 'Unknown',
        };
      });
    
    const report = {
      overview: {
        totalUsers,
        totalMovies,
        totalViews,
        totalDownloads,
        totalActivity: totalViews + totalDownloads,
      },
      topMovies,
      topUsers,
      recentActivities,
      generatedAt: new Date().toISOString(),
    };
    
    console.log("Analytics report generated successfully");
    return c.json({ success: true, report });
  } catch (error) {
    console.log(`Error generating analytics report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== AD SETTINGS ROUTES ====================

// Get ad settings
app.get("/make-server-4d451974/ad-settings", async (c) => {
  try {
    console.log("Fetching ad settings...");
    const settings = await kv.get("ad_settings");
    
    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        adsEnabled: false,
        propellerAdsEnabled: false,
        propellerAdsPublisherId: '',
        adsterraEnabled: false,
        adsterraPublisherId: '',
        showAdBeforeVideo: false,
        showAdBetweenContent: false,
        showAdOnDownload: false,
        showBannerAds: false,
        showPopunderAds: false,
        videoAdFrequency: 1,
        downloadAdFrequency: 1,
        skipAdAfterSeconds: 5,
        adBlockerDetection: false,
      };
      return c.json({ success: true, settings: defaultSettings });
    }
    
    return c.json({ success: true, settings });
  } catch (error) {
    console.log(`Error fetching ad settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ad settings
app.put("/make-server-4d451974/ad-settings", async (c) => {
  try {
    const body = await c.req.json();
    const { settings } = body;
    
    if (!settings) {
      return c.json({ success: false, error: "Settings data required" }, 400);
    }
    
    console.log("Updating ad settings:", settings);
    await kv.set("ad_settings", settings);
    
    return c.json({ success: true, message: "Ad settings updated successfully" });
  } catch (error) {
    console.log(`Error updating ad settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== DOWNLOAD PROXY ROUTE =====
// Proxy downloads to handle CORS issues with external video URLs
app.get("/make-server-4d451974/download-proxy", async (c) => {
  try {
    const videoUrl = c.req.query("url");
    const filename = c.req.query("filename") || "video.mp4";
    
    if (!videoUrl) {
      return c.json({ success: false, error: "URL parameter required" }, 400);
    }
    
    console.log("📥 Proxying download for URL:", videoUrl);
    console.log("📥 Filename:", filename);
    
    // Fetch the video from the external URL
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      return c.json({ 
        success: false, 
        error: `Failed to fetch video: ${response.status} ${response.statusText}` 
      }, response.status);
    }
    
    // Get the content type from the source
    const contentType = response.headers.get("Content-Type") || "video/mp4";
    const contentLength = response.headers.get("Content-Length");
    
    console.log("✅ Successfully fetched video, streaming to client...");
    console.log("Content-Type:", contentType);
    console.log("Content-Length:", contentLength);
    
    // Stream the response directly to avoid memory issues with large files
    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": contentLength || "",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Download proxy error:", error);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// ========== GM FEED ENDPOINTS (Great Moments - TikTok-style temporary content) ==========

// Get all GM content (filter by 72 hours)
app.get("/make-server-4d451974/w-feed", async (c) => {
  try {
    console.log("📱 Fetching GM feed content...");
    const wContentData = await kv.getByPrefix("w:");
    const wContent = Array.isArray(wContentData) ? wContentData.map(item => item.value || item) : [];
    
    // Filter content that's less than 72 hours old
    const now = Date.now();
    const validContent = wContent.filter(item => {
      const uploadTime = new Date(item.uploadedAt).getTime();
      const hoursSinceUpload = (now - uploadTime) / (1000 * 60 * 60);
      return hoursSinceUpload < 72;
    });
    
    // Sort by newest first
    validContent.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    console.log(`✅ Found ${validContent.length} valid GM content items (within 72 hours)`);
    return c.json({ success: true, content: validContent });
  } catch (error) {
    console.log(`❌ Error fetching GM feed: ${error}`);
    return c.json({ success: false, error: String(error), content: [] }, 500);
  }
});

// Upload W content
app.post("/make-server-4d451974/w-feed/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      console.log("❌ Unauthorized W upload attempt");
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const contentType = formData.get('contentType') as string; // 'video' or 'image'
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    console.log(`📱 User ${user.email} uploading W content: ${file.name}`);

    // Create bucket if it doesn't exist
    const bucketName = 'make-4d451974-w-content';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log("🪣 Creating W content bucket...");
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log(`❌ Upload error: ${uploadError.message}`);
      return c.json({ success: false, error: uploadError.message }, 500);
    }

    // Get signed URL (valid for 72 hours + buffer)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 72 * 60 * 60 + 3600); // 72 hours + 1 hour buffer

    // Store metadata in KV store
    const wId = `w:${Date.now()}_${user.id}`;
    const wData = {
      id: wId,
      userId: user.id,
      userEmail: user.email,
      caption: caption || '',
      contentType: contentType || 'video',
      fileUrl: urlData?.signedUrl || '',
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
    };

    await kv.set(wId, wData);
    console.log(`✅ W content uploaded successfully: ${wId}`);

    return c.json({ success: true, content: wData });
  } catch (error) {
    console.log(`❌ Error uploading W content: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete W content (user deletes their own content)
app.delete("/make-server-4d451974/w-feed/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const wId = c.req.param('id');
    console.log(`🗑️ User ${user.email} deleting W content: ${wId}`);

    // Get content to verify ownership
    const content = await kv.get(wId);
    if (!content) {
      return c.json({ success: false, error: 'Content not found' }, 404);
    }

    if (content.userId !== user.id) {
      return c.json({ success: false, error: 'Not authorized to delete this content' }, 403);
    }

    // Delete from storage
    const bucketName = 'make-4d451974-w-content';
    await supabase.storage.from(bucketName).remove([content.fileName]);

    // Delete from KV store
    await kv.del(wId);
    
    console.log(`✅ W content deleted successfully: ${wId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`❌ Error deleting W content: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Cleanup expired GM content (call this periodically)
app.post("/make-server-4d451974/w-feed/cleanup", async (c) => {
  try {
    console.log("🧹 Starting GM feed cleanup...");
    const wContentData = await kv.getByPrefix("w:");
    const wContent = Array.isArray(wContentData) ? wContentData.map(item => item.value || item) : [];
    
    const now = Date.now();
    const bucketName = 'make-4d451974-w-content';
    let deletedCount = 0;

    for (const item of wContent) {
      const uploadTime = new Date(item.uploadedAt).getTime();
      const hoursSinceUpload = (now - uploadTime) / (1000 * 60 * 60);
      
      if (hoursSinceUpload >= 72) {
        console.log(`🗑️ Deleting expired W content: ${item.id} (${hoursSinceUpload.toFixed(1)} hours old)`);
        
        // Delete from storage
        await supabase.storage.from(bucketName).remove([item.fileName]);
        
        // Delete from KV store
        await kv.del(item.id);
        deletedCount++;
      }
    }
    
    console.log(`✅ GM feed cleanup complete. Deleted ${deletedCount} expired items.`);
    return c.json({ success: true, deletedCount });
  } catch (error) {
    console.log(`❌ Error during GM feed cleanup: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);