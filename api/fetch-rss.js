/**
 * Serverless function to fetch RSS/Atom feeds and bypass CORS restrictions
 * This acts as a proxy that fetches feeds server-side where CORS doesn't apply
 * 
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get and validate the URL parameter
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  // Basic URL validation - ensure it's a valid HTTP(S) URL
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only HTTP(S) URLs are allowed' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Fetch the RSS feed with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'feed.rss RSS Reader (Vercel Serverless)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeoutId);

    // Check if the fetch was successful
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch RSS feed: HTTP ${response.status}`,
      });
    }

    // Get the response text
    const text = await response.text();

    // Set CORS headers to allow frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // Cache for 5 minutes

    // Return the RSS feed content
    return res.status(200).send(text);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);

    // Handle timeout errors
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout - feed took too long to respond' });
    }

    // Handle other fetch errors
    return res.status(500).json({
      error: 'Failed to fetch RSS feed',
      details: error.message,
    });
  }
}
