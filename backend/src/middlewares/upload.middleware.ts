import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import multer, { type FileFilterCallback } from "multer";
import fileType from "file-type";
import type { Request } from "express";
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

const multerUpload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(ApiError.validation("Formato de imagem não suportado. Use JPEG, PNG, WEBP ou GIF."));
      return;
    }
    cb(null, true);
  },
}).single("image");

/**
 * Confirma que o conteúdo real do arquivo salvo em disco corresponde a um
 * dos formatos de imagem permitidos, lendo a assinatura binária (magic
 * bytes) em vez de confiar no Content-Type declarado pelo cliente — que é
 * trivialmente forjável. Remove o arquivo do disco se a validação falhar.
 */
async function validateUploadedFileSignature(file: Express.Multer.File): Promise<void> {
  const detected = await fileType.fromFile(file.path);
  const allowedRealTypes = new Set(["jpg", "png", "webp", "gif"]);
  if (!detected || !allowedRealTypes.has(detected.ext)) {
    await fsPromises.unlink(file.path).catch(() => undefined);
    throw ApiError.validation(
      "O conteúdo do arquivo enviado não corresponde a uma imagem válida (JPEG, PNG, WEBP ou GIF).",
    );
  }
}

export function uploadProductImage(
  req: Request,
  res: Parameters<typeof multerUpload>[1],
  next: (err?: unknown) => void,
): void {
  multerUpload(req, res, (err: unknown) => {
    if (err) {
      next(err);
      return;
    }
    if (!req.file) {
      next();
      return;
    }
    validateUploadedFileSignature(req.file)
      .then(() => next())
      .catch(next);
  });
}

export function buildImageUrl(filename: string): string {
  return `/${env.UPLOAD_DIR}/${filename}`.replace(/\/+/g, "/");
}