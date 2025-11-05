
const express=require("express");
const dotenv=require("dotenv");

 const cors =require("cors");
const connectDB=require("./config/db");

dotenv.config();
connectDB();

const app=express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
   res.send("🎵 Welcome to MusicJunction API");
});
const PORT=process.env.PORT || 8085;

app.listen(PORT,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
})