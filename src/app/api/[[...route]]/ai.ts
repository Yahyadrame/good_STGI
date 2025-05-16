import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { replicate } from "@/lib/replicate";
import { scheduler } from "timers/promises";

const app = new Hono()
  .post(
    "/remove-bg",
    zValidator("json", z.object({ image: z.string() })),
    async (c) => {
      const { image } = c.req.valid("json");

      const output: unknown = await replicate.run(
        "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        {
          input: {
            image: image,
          },
        }
      );
      const res = output as string;
      return c.json({ data: res });
    }
  )
  .post(
    "/generate-image",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      })
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");

      const input = {
        prompt: prompt,
        num_inference_steps: 50, // Ajusté pour une qualité raisonnable
        guidance_scale: 7.5,
        // Paramètres spécifiques à flux-dev-lora (optionnel, à ajuster selon les docs)
        // Ajoute l'option go_fast si besoin : go_fast: true
      };

      try {
        console.log("Calling Replicate with input:", input);
        const output = await replicate.run("black-forest-labs/flux-dev-lora", {
          input,
        });

        console.log("Replicate output:", output);

        const res = Array.isArray(output) ? output[0] : output;
        if (typeof res !== "string") {
          throw new Error("Invalid image URL from Replicate");
        }

        return c.json({ data: res });
      } catch (error) {
        console.error("Error generating image:", error.message || error);
        return c.json(
          {
            error: "Failed to generate image",
            details: error.message || error.toString(),
          },
          502
        );
      }
    }
  );

export default app;
