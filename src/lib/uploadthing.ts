import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { createUploadthing } from "uploadthing/next";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete, file URL:", file.url);
    return { url: file.url };
  }),
};

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();