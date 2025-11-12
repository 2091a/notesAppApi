import { Note } from "../models/note.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🔍 Search Notes Controller
export const searchNotes = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  // 1️⃣ Try PHRASE MATCH using $text (requires text index)
  let notes = await Note.find({ $text: { $search: `"${query}"` } });

  // 2️⃣ If no text match, try FUZZY MATCH with regex
  if (notes.length === 0) {
    notes = await Note.find({
      $or: [
        { noteTitle: { $regex: query, $options: "i" } },
        { noteDiscription: { $regex: query, $options: "i" } },
      ],
    });
  }

  // 3️⃣ Return response
  return res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});
