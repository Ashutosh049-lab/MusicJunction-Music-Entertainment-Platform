
// const express=require("express");
// const dotenv=require("dotenv");

//  const cors =require("cors");
// const connectDB=require("./config/db");
// const authRoutes = require("./routes/auth");

// dotenv.config();
// connectDB();

// const app=express();
// app.use(cors());
// app.use(express.json());


// app.use('/api/auth', authRoutes);


// app.get("/", (req, res) => {
//    res.send("🎵 Welcome to MusicJunction API");
// });
// const PORT=process.env.PORT || 8085;

// app.listen(PORT,()=>{
//     console.log(`🚀 Server running on port ${PORT}`);
// })





// index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // load .env from Backend folder

const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");

// WebSocket (optional)
let attachWebSocket = () => {};
try {
  ({ attachWebSocket } = require("./realtime/ws"));
} catch (err) {
  console.warn("Realtime disabled: ./realtime/ws not found");
}

// Connect DB and start server
connectDB();

const PORT = process.env.PORT || 8085;
const server = http.createServer(app);
attachWebSocket(server);
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
