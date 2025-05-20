const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, ".")));

const authRouter = require("./js/routes/loginRoute");
const adminRouter = require("./js/routes/adminRoutes");
const orderTrackingRouter = require("./js/routes/orderTrackingRoutes");
app.use("/api", authRouter);
app.use("/api", adminRouter);
app.use("/api", orderTrackingRouter);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not Found" });
});

const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    //console.log(`🔐 Login: http://localhost:${PORT}/pages/auth/login.html`);
    //console.log(` Admin: http://localhost:${PORT}/pages/admin/project.html`);
  }
});
