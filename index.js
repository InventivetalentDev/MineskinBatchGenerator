const path = require("path");
const fs = require("fs/promises");
const axios = require("axios").default;
const FormData = require("form-data");

const DIR = "../Skins";
const OUT = "../skin-list.csv";
const DELAY = 5;
const KEY = "4276ac263bef9e2db54f14a7c5f9b1bb0d431b89fffbefc4b5dbb05d061ce7f0";

function cycle() {
    try {
        return run()
            .catch(e => console.warn(e))
            .then(() => {
                setTimeout(() => {
                    return cycle();
                }, 1000 * DELAY);
            })
    } catch (e) {
        console.warn(e);
    }
}

// start
(async () => {
    await fs.writeFile(OUT, "File,UUID,Variant,Value,Signature,URL\n", "utf8");
    await cycle();
})()

async function run() {
    return fs.readdir(DIR).then(files => {
        if (files.length === 0) {
            console.log("Done!");
            process.exit(0);
            return;
        }
        const filename = files[Math.floor(Math.random() * files.length)];
        const file = path.join(DIR, filename);
        console.log(file);
        return fs.readFile(file).then(data => {
            return generate(data)
                .then(async skin => {
                    await fs.appendFile(OUT, [filename, skin["uuid"], skin["variant"], skin["data"]["texture"]["value"], skin["data"]["texture"]["signature"], skin["data"]["texture"]["url"]].join(",") + "\n", "utf8");
                    return fs.unlink(file);
                })
        })
    }).catch(err => {
        console.warn(err)
    })
}

function generate(data) {
    const formData = new FormData();
    formData.append("file", data);
    return axios.post("https://api.mineskin.org/generate/upload", formData, {
        headers: formData.getHeaders({
            "User-Agent": "MineSkinBatchGenerator",
            "Authorization": "Bearer " + KEY
        })
    }).then(res => res.data);
}
