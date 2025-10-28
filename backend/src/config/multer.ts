import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Criar a pasta uploads/payload se não existir
const uploadDir = path.resolve("uploads", "payload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage do Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar por mimetype E por extensão (para maior compatibilidade)
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  const extension = path.extname(file.originalname).toLowerCase();
  const mimetypeValid = allowedMimes.includes(file.mimetype);
  const extensionValid = allowedExtensions.includes(extension);

  if (mimetypeValid || extensionValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, JPG, PNG, WEBP and GIF are allowed. Received: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
