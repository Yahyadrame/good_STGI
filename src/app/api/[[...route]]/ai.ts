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
        scheduler: "K_EULER",
        prompt: prompt,
      };

      const output = await replicate.run("stability-ai/stable-diffusion-3", {
        input,
      });

      const res = output as Array<string>;

      return c.json({ data: res[0] });
    }
  );

export default app;
