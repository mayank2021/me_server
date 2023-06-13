const router = require("express").Router();
const JWT = require("jsonwebtoken");
const { users } = require("../database");

require("dotenv").config();

// Log in
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Look for user email in the database
  let user = users.find((user) => {
    return user.email === email && user.password === password;
  });

  // If user not found, send error message
  if (!user) {
    return res.status(400).json({
      errors: [
        {
          msg: "Invalid credentials",
        },
      ],
    });
  }

  // Send JWT access token
  const accessToken = await JWT.sign(
    { email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1m",
    }
  );

  // Refresh token
  const refreshToken = await JWT.sign(
    { email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  // Set refersh token in refreshTokens array
  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
  });
});

let refreshTokens = [];

// Create new access token from refresh token
router.post("/token", async (req, res) => {
  const refreshToken = req.header("x-auth-token");

  // If token is not provided, send error message
  if (!refreshToken) {
    res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }

  // If token does not exist, send error message
  if (!refreshTokens.includes(refreshToken)) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }

  try {
    const user = await JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // user = { email: 'jame@gmail.com', iat: 1633586290, exp: 1633586350 }
    const { email } = user;
    const accessToken = await JWT.sign(
      { email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});

// Deauthenticate - log out
// Delete refresh token
router.delete("/logout", (req, res) => {
  const refreshToken = req.header("x-auth-token");

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.sendStatus(204);
});

module.exports = router;
