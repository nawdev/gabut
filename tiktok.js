const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const regex = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/; // validasi url

module.exports = async (req, res) => {
    const url = req.query.u;
    if (url === undefined) {
        res.json({
            status: false,
            msg: "URL tidak ada"
        });
    } else if (!regex.test(url)) {
        res.json({
            status: false,
            msg: "URL tidak valid, harap periksa kembali dan kirim ulang"
        });
    } else {
        async function tiktok(url) {
            try {
                const t = await axios.post("https://lovetik.com/api/ajax/search", { query: url });

                const result = {
                    title: clean(t.data.desc),
                    author: clean(t.data.author),
                    videoUrl: await shortener((t.data.links[0].a || "").replace("https", "http")),
                    watermark: await shortener((t.data.links[1].a || "").replace("https", "http")),
                    audio: await shortener((t.data.links[2].a || "").replace("https", "http")),
                    thumbnail: await shortener(t.data.cover)
                };

                await saveToFile(result, 'downloads/result.json'); // Simpan hasil unduhan ke file

                return result;
            } catch (error) {
                throw error;
            }
        }

        try {
            const tiktokResult = await tiktok(url);
            res.json({
                status: true,
                result: tiktokResult
            });
        } catch (error) {
            res.json({
                status: false,
                msg: "Error saat memproses data TikTok"
            });
        }
    }
};

function clean(input) {
    // Tambahkan logika pembersihan jika diperlukan
    return input.trim();
}

async function shortener(e) {
    // Tambahkan logika penyusutan URL jika diperlukan
    return e;
}

async function saveToFile(data, filePath) {
    const absolutePath = path.join(__dirname, filePath);
    const jsonData = JSON.stringify(data, null, 2);

    await fs.writeFile(absolutePath, jsonData);
}
