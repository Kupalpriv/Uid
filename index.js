const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const regExCheckURL = /https:\/\/www\.facebook\.com\/[a-zA-Z0-9\.]+/;

async function findUid(link) {
    try {
        const response = await axios.post(
            'https://seomagnifier.com/fbid',
            new URLSearchParams({ facebook: '1', sitelink: link }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }
        );

        if (!isNaN(response.data)) return response.data;

        const html = await axios.get(link);
        const $ = cheerio.load(html.data);

        const metaContent = $('meta[property="al:android:url"]').attr('content');
        if (metaContent && metaContent.includes('fb://profile/')) {
            return metaContent.split('/').pop();
        }

        const matchEntity = html.data.match(/"entity_id":"(\d+)"/);
        if (matchEntity) return matchEntity[1];

        const matchUser = html.data.match(/"userID":"(\d+)"/);
        if (matchUser) return matchUser[1];

        throw new Error('Uid not found.');
    } catch (err) {
        throw new Error('An error occurred while fetching Uid.');
    }
}

app.get('/fbuid', async (req, res) => {
    const link = req.query.url;

    if (!link || !regExCheckURL.test(link)) {
        return res.status(400).json({ error: 'Invalid or missing Facebook url' });
    }

    try {
        const yuwid = await findUid(link);
        return res.json({ uruid });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Facebook UID API is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
