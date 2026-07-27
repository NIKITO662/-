export default async function handler(req, res) {
    const { path } = req.query;
    
    if (!path) {
        return res.status(400).json({ error: 'Missing path parameter' });
    }

    try {
        const safePath = path.startsWith('/') ? path : '/' + path;
        const targetUrl = `https://www.pekora.zip${safePath}`;
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
