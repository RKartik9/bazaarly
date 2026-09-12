import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfigured, env } from "@/lib/env";
import { AppError } from "@/lib/errors";

let configured = false;

function client() {
  if (!cloudinaryConfigured) throw new AppError("Image uploads are not configured. Add Cloudinary keys to .env.local.");
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export function signUpload(folder: string): UploadSignature {
  const cld = client();
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `bazaar/${folder}`;
  const signature = cld.utils.api_sign_request({ timestamp, folder: fullFolder }, env.CLOUDINARY_API_SECRET!);
  return { cloudName: env.CLOUDINARY_CLOUD_NAME!, apiKey: env.CLOUDINARY_API_KEY!, timestamp, signature, folder: fullFolder };
}
