const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const METABASE_SITE_URL = "http://10.130.54.25:3001";
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

router.get("/metabase-dashboard", (req, res) => {
  const payload = {
    resource: { dashboard: 1 },
    params: {},
    exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 min expiry
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

  res.send(`
    <iframe
      src="${iframeUrl}"
      frameborder="0"
      width="100%"
      height="800"
      allowtransparency
    ></iframe>
  `);
});

module.exports = router;
