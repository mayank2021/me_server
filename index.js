const express = require("express");

const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.use("/auth", require("./routes/auth"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
