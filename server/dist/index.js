"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// ROUTES IMPORTS
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const videoRoutes_1 = __importDefault(require("./routes/videoRoutes"));
const viewRoutes_1 = __importDefault(require("./routes/viewRoutes"));
const tweetRoutes_1 = __importDefault(require("./routes/tweetRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const likeRoutes_1 = __importDefault(require("./routes/likeRoutes"));
const playlistRoutes_1 = __importDefault(require("./routes/playlistRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
// CONFIGURATIONS
dotenv_1.default.config({ quiet: true });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({
    limit: "16kb",
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "200mb" }));
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
// ROUTES
app.get("/", (req, res) => {
    res.send("This is home route.");
});
app.use("/users", userRoutes_1.default);
app.use("/videos", videoRoutes_1.default);
app.use("/views", viewRoutes_1.default);
app.use("/tweets", tweetRoutes_1.default);
app.use("/comments", commentRoutes_1.default);
app.use("/likes", likeRoutes_1.default);
app.use("/playlists", playlistRoutes_1.default);
app.use("/subscriptions", subscriptionRoutes_1.default);
app.use("/dashboard", dashboardRoutes_1.default);
// SERVER
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
