const express = require('express');
const router = express.Router();
router.get("/", (req, res) => {
    return res.send("OrderErrorRouter Router is working!");
});

module.exports = router;