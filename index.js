const path = require("path");
const fs = require("fs/promises");
const axios = require("axios").default;
const FormData = require("form-data");

const DIR = "../Skins";
const DELAY = 2;
const KEY = "";

function cycle() {
    try {
        run()
            .catch(e => console.warn(e))
            .then(() => {
                setTimeout(() => {
                    cycle();
                }, 1000 * DELAY);
            })
    } catch (e) {
        console.warn(e);
    }
}

cycle();

function run() {
    return fs.readdir(DIR).then(files => {
        if (files.length === 0) {
            console.log("Done!");
            process.exit(0);
            return;
        }
        const file = path.join(DIR, files[Math.floor(Math.random() * files.length)]);
        console.log(file);
        return fs.readFile(file).then(data => {
            return generate(data)
                .then(skin => {
                    console.log("  https://minesk.in/" + skin);
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
    }).then(res => res.data.uuid);
}
