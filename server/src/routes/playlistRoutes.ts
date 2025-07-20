import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  getVideoPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlistController";

const router = Router();

router.get("/:playlistId", openAuth, getPlaylistById);
router.get("/user/:userId", openAuth, getUserPlaylists);
router.get("/user/p/:videoId", verifyJWT, getVideoPlaylist);

router.post("/", verifyJWT, createPlaylist);

router.patch("/add/:videoId/:playlistId", verifyJWT, addVideoToPlaylist);
router.patch(
  "/remove/:videoId/:playlistId",
  verifyJWT,
  removeVideoFromPlaylist
);
router.patch("/:playlistId", verifyJWT, updatePlaylist);

router.delete("/:playlistId", verifyJWT, deletePlaylist);

export default router;
