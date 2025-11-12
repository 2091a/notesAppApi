import { asyncHandler } from "../utils/asyncHandler.js";

// --- Single File Upload ---
 const singleFileUplod = asyncHandler(async(req, res) => {
  console.log(req.file);

  res.json({
    message: "Single file uploaded successfully",
    fileUrl: `/uploads/${req.file.filename}`,
  });
});

// --- Multiple File Upload ---
const multipleFileUplod = asyncHandler(async (req, res) => {
  console.log(req.files);

  const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);

  res.json({
    message: "Multiple files uploaded successfully",
    files: fileUrls,
  });
});

export { singleFileUplod, multipleFileUplod }