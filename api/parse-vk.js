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
          (async ({ page, context }) => {
            await page.goto('${url}', { waitUntil: 'domcontentloaded' });
            const title = await page.title();
            let desc = '';
            try {
              desc = await page.$eval('meta[name="description"]', el => el.content);
            } catch (e) {
              desc = 'Описание не найдено';
            }
            return { title, description: desc };
          })
        `
      })
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Ошибка при запросе к browserless:", err);
    let errorText = '';
    try {
      errorText = await err?.response?.text?.();
    } catch (e) {
      errorText = err.message;
    }
    console.error("📄 Ответ от browserless:", errorText);
    res.status(500).json({ error: 'Failed to parse VK video', details: errorText });
  }
}
