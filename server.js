const express = require("express");
const app = express();
app.use(express.static("dist"));

app.get("/", (req, res) => {
	res.sendFile("dist/index.html", { root: __dirname });
});

app.get("/api", function (req, res) {
	res.json(artistData);
});

app.get("*", (req, res) => {
	res.redirect("/");
});

app.listen(8000, () => console.log("Listening on port 8000"));
