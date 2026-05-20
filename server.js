const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", (req, res) => {
    console.log("User Data:", req.body);
    res.send("Done");
});

app.listen(3000, () => console.log("Server running on port 3000"));