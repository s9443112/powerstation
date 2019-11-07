const express = require("express");
const router = express.Router();

const model = require("../model");
const { CommonMiddleware } = require("../middleware");

router.get("/powerstation", async (req, res) => {
    var data = [
        {
            "id":1,
            "city":"台東",
            "station":"發電機1"
        },
        {
            "id":2,
            "city":"台東",
            "station":"發電機2"
        }
    ]
    res.json(data)
})

module.exports = router