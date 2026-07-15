import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generatePPTX } from "./pptx-generator";
import * as fs from "fs";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  pptx: router({
    generate: publicProcedure
      .input(
        z.object({
          products: z.array(
            z.object({
              laoName: z.string(),
              englishName: z.string(),
              price: z.string(),
              barcode: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const pptxPath = await generatePPTX(input.products);
          const fileBuffer = fs.readFileSync(pptxPath);
          const base64 = fileBuffer.toString("base64");

          // Clean up temp file
          try {
            fs.unlinkSync(pptxPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          return {
            success: true,
            data: base64,
            filename: `technohub_products_${Date.now()}.pptx`,
          };
        } catch (error) {
          throw new Error(
            `Failed to generate PPTX: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
