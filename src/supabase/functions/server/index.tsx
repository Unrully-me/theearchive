import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

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

// Get ad settings (try 'ads:all' then fallback to prefix)
app.get("/make-server-4d451974/settings", async (c) => {
  try {
    // First try a single settings object stored under 'ads:all'
    const all = await kv.get('ads:all');
    if (all) {
      return c.json({ success: true, settings: all });
    }

    // Fallback to key-per-setting style (ads:client, ads:downloadSlot etc.)
    const settingsArray = await kv.getByPrefix("ads:");
    // kv.getByPrefix might return just values or objects; normalize
    const normalized = Array.isArray(settingsArray)
      ? settingsArray.map(item => (typeof item === 'object' && item !== null && item.key ? { key: item.key, value: item.value } : item))
      : [];

    // Attempt to turn array of values into an object map, if possible
    const map: Record<string, any> = {};
    // when values are objects with inner 'key', we'll use that
    for (const entry of normalized) {
      if (entry && typeof entry === 'object' && 'key' in entry) {
        map[(entry as any).key] = (entry as any).value;
      } else if (entry && typeof entry === 'object') {
        // if entry itself is a key-value pair object
        if ('name' in entry && 'value' in entry) {
          map[(entry as any).name] = (entry as any).value;
        }
      }
    }

    return c.json({ success: true, settings: map });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ success: false, error: String(error), settings: {} }, 500);
  }
});

// Get a single ad setting
app.get("/make-server-4d451974/settings/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const fullKey = `ads:${key}`;
    const setting = await kv.get(fullKey);
    if (setting === null || setting === undefined) {
      return c.json({ success: false, error: "Setting not found" }, 404);
    }
    return c.json({ success: true, key, value: setting });
  } catch (error) {
    console.log(`Error fetching setting: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Set (or update) an ad setting
app.post("/make-server-4d451974/settings", async (c) => {
  try {
    const body = await c.req.json();
    const { key, value, settings } = body;
    // If the client sends a full 'settings' object, save it as ads:all
    if (settings && typeof settings === 'object') {
      await kv.set('ads:all', settings);
      return c.json({ success: true, key: 'all', value: settings });
    }
    if (!key || value === undefined) {
      return c.json({ success: false, error: "key and value required" }, 400);
    }
    const fullKey = `ads:${key}`;
    await kv.set(fullKey, value);
    return c.json({ success: true, key, value });
  } catch (error) {
    console.log(`Error setting ad setting: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete an ad setting
app.delete("/make-server-4d451974/settings/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const fullKey = `ads:${key}`;
    await kv.del(fullKey);
    return c.json({ success: true, key });
  } catch (error) {
    console.log(`Error deleting ad setting: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new movie
app.post("/make-server-4d451974/movies", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, videoUrl, thumbnailUrl, genre, year, type, fileSize } = body;

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
      createdAt: new Date().toISOString(),
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

Deno.serve(app.fetch);