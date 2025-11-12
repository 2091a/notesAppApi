// routes/note.routes.js
import { Router } from "express";
import { searchNotes } from "../controllers/note.controller.js";

const router = Router();

router.route("/search").get(searchNotes);

export default router;
