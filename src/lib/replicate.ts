import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log(
  "Replicate API Token loaded:",
  process.env.REPLICATE_API_TOKEN ? "Yes" : "No"
);