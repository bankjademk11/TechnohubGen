import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("pptx.generate", () => {
  it("generates a valid PPTX from product data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const testProducts = [
      {
        laoName: "ຄີບອດKB903L [HAVIT]",
        englishName: "Gaming Keyboard KB903L Black [HAVIT]",
        price: "885,000 Kip",
        barcode: "6939119022815",
      },
      {
        laoName: "ເຄື່ອງນວດMG102 [HAVIT]",
        englishName: "Mini Massage Gun MG102 [HAVIT]",
        price: "471,000 Kip",
        barcode: "6939119049058",
      },
    ];

    const result = await caller.pptx.generate({
      products: testProducts,
    });

    // Verify result structure
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("filename");

    // Verify filename format
    expect(result.filename).toMatch(/^technohub_products_\d+\.pptx$/);

    // Verify base64 data is valid
    expect(result.data).toBeTruthy();
    expect(typeof result.data).toBe("string");

    // Verify base64 can be decoded
    const binaryString = atob(result.data);
    expect(binaryString.length).toBeGreaterThan(1000); // PPTX files are typically > 1KB

    // Verify it's a valid ZIP file (PPTX is ZIP format)
    expect(binaryString.charCodeAt(0)).toBe(80); // 'P'
    expect(binaryString.charCodeAt(1)).toBe(75); // 'K'
  });

  it("handles empty product list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pptx.generate({
      products: [],
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data");
  });

  it("generates correct filename with timestamp", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pptx.generate({
      products: [
        {
          laoName: "Test",
          englishName: "Test",
          price: "100",
          barcode: "123",
        },
      ],
    });

    const timestamp = parseInt(result.filename.match(/\d+/)?.[0] || "0");
    const now = Date.now();

    // Verify timestamp is recent (within last 5 seconds)
    expect(now - timestamp).toBeLessThan(5000);
  });
});
