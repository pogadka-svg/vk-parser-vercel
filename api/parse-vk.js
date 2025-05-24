export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url || !url.includes('vk.com/video')) {
    return res.status(400).json({ error: 'Invalid or missing VK video URL' });
  }

  try {
    const browserlessApi = 'https://chrome.browserless.io/function?token=2SMzLxAIJYMaWLQ8950b3ccc5c8b21695503d3fabc67cba65';

    const response = await fetch(browserlessApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `
          const puppeteer = require('puppeteer');
          (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('${url}', { waitUntil: 'domcontentloaded' });
            const title = await page.title();
            const desc = await page.$eval('meta[name="description"]', el => el.content);
            await browser.close();
            return { title, description: desc };
          })();
        `
      })
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse VK video' });
  }
}
