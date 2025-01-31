import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";
import "./jobs/index.js"





const app =express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors({
    origin: "*",
}))
app.use(limiter);




app.get("/", (req, res) => {
    return res.json({message:"Hello i am working fine"});
});


app.use("/api", ApiRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));

