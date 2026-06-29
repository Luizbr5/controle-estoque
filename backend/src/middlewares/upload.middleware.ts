import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "@/config/env";
import { ApiError } from "@/utils/ApiError";

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(ApiError.validation("Formato de imagem não suportado. Use JPEG, PNG, WEBP ou GIF."));
      return;
    }
    cb(null, true);
  },
}).single("image");

export function buildImageUrl(filename: string): string {
  return `/${env.UPLOAD_DIR}/${filename}`.replace(/\/+/g, "/");
}
