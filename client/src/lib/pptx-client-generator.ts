import PptxGenJS from "pptxgenjs";

// Convert EMUs to Inches (1 inch = 914400 EMU)
const EMU_PER_INCH = 914400;
const e2i = (emu: number) => emu / EMU_PER_INCH;

export interface ProductData {
  laoName: string;
  englishName: string;
  price: string;
  barcode: string;
}

export async function generatePPTXClient(
  products: ProductData[], 
  tagMode: "standard" | "long" = "standard",
  onProgress?: (pct: number) => void
) {
  const pres = new PptxGenJS();
  
  const slideWidth = e2i(10691813);
  const slideHeight = e2i(7559675);
  pres.defineLayout({ name: 'CUSTOM', width: slideWidth, height: slideHeight });
  pres.layout = 'CUSTOM';
  
  // ตัวคูณขนาด (Scale) 
  // 1.15 คือขยายใหญ่ขึ้น 15% จากเดิม เพื่อให้พอดีกับกรอบพลาสติกในรูป
  const SCALE = 1.15; 
  
  // กำหนดขนาดการ์ดตามโหมด
  // โหมด 'long' จะมีความกว้างยาวพิเศษ เพื่อให้ยาวเต็มช่องใส่วินโดว์ยาว
  const baseCardW = tagMode === "long" ? 3256000 : 2554041; // 3700000 * 0.88 = ลด 12%
  const cardW = e2i(baseCardW * SCALE);
  const cardH = e2i(1459469 * SCALE); // ความสูงเท่ากันทั้งสองแบบ
  
  // กำหนดจำนวนคอลัมน์
  // แบบมาตรฐานจัดเรียงได้ 3 คอลัมน์, แบบยาวจัดเรียงได้ 2 คอลัมน์
  const cols = tagMode === "long" ? 2 : 3; 
  const rows = 4; 
  const cardsPerSlide = cols * rows;
  
  // จัดให้อยู่กึ่งกลางหน้ากระดาษ A4 มากขึ้น
  const marginL = tagMode === "long" ? e2i(266700 * 3.0) : e2i(266700 * 2.5);
  const marginT = e2i(190914 * 2);
  
  // Specs for internal placement
  const logoW = e2i(2414041 * SCALE);
  const logoH = e2i(460000 * SCALE);
  const logoL = e2i(70000 * SCALE);
  const logoT = e2i(40000 * SCALE);
  
  const lineW = cardW; // ให้เส้นน้ำเงินยาวเต็มความกว้างการ์ด
  const lineH = e2i(60000 * SCALE);
  const lineL = e2i(0);
  const lineT = e2i(520000 * SCALE);
  
  const nameL = e2i(70000 * SCALE);
  const nameT = e2i(650000 * SCALE);
  // ความกว้างชื่อปรับตามความยาวการ์ด โดยเว้นระยะขอบขวาไว้ 70000 * SCALE
  const nameW = cardW - nameL - e2i(70000 * SCALE);
  const nameH = e2i(380000 * SCALE);
  
  // ปรับตำแหน่งราคากล่องตามโหมด เพื่อให้ชิดขวาเสมอ
  const priceL = tagMode === "long" ? e2i(1800000 * SCALE) : e2i(1000000 * SCALE);
  const priceT = e2i(1100000 * SCALE);
  const priceW = cardW - priceL - e2i(70000 * SCALE);
  const priceH = e2i(280000 * SCALE);
  
  const barcodeL = e2i(70000 * SCALE);
  const barcodeT = e2i(1280000 * SCALE);
  const barcodeW = e2i(1000000 * SCALE);
  const barcodeH = e2i(150000 * SCALE);

  // Group products into slides
  for (let i = 0; i < products.length; i += cardsPerSlide) {
    const slideChunk = products.slice(i, i + cardsPerSlide);
    const slide = pres.addSlide();
    
    // Process each card
    slideChunk.forEach((product, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cardLeft = marginL + (col * cardW);
      const cardTop = marginT + (row * cardH);
      
      // Card Border
      slide.addShape(pres.ShapeType.rect, {
        x: cardLeft, y: cardTop, w: cardW, h: cardH,
        line: { color: "000000", width: 2.0 },
        fill: { color: "FFFFFF" }
      });
      
      // Logo (fetched from public folder via URL in browser)
      slide.addImage({
        path: "/techno-hub-logo.jpg",
        x: cardLeft + logoL, y: cardTop + logoT, w: logoW, h: logoH,
        sizing: { type: "contain", w: logoW, h: logoH }
      });
      
      // Blue Line
      slide.addShape(pres.ShapeType.rect, {
        x: cardLeft + lineL, y: cardTop + lineT, w: lineW, h: lineH,
        fill: { color: "4472C4" },
        line: { color: "4472C4" }
      });
      
      // Names (Lao + English) - using multiple text objects inside one block for auto-flow
      const textObjects = [
        { text: product.laoName + (product.englishName ? "\n" : ""), options: { fontFace: "Noto Sans Lao", fontSize: 11, bold: true, color: "000000" } }
      ];
      if (product.englishName) {
         textObjects.push({ text: product.englishName, options: { fontFace: "Noto Sans", fontSize: 8.5, bold: false, color: "6499DE" } });
      }

      slide.addText(textObjects, {
        x: cardLeft + nameL, y: cardTop + nameT, w: nameW, h: nameH,
        valign: "top", margin: 0,
        wrap: true, shrinkText: true
      });
      
      // Price
      slide.addText(product.price, {
        x: cardLeft + priceL, y: cardTop + priceT, w: priceW, h: priceH,
        fontFace: "Noto Sans", fontSize: 18, bold: true, color: "FF0000",
        align: "right", valign: "top", margin: 0, wrap: false, shrinkText: true
      });
      
      // Barcode
      slide.addText(product.barcode, {
        x: cardLeft + barcodeL, y: cardTop + barcodeT, w: barcodeW, h: barcodeH,
        fontFace: "Noto Sans", fontSize: 9, bold: false, color: "000000",
        valign: "top", margin: 0, wrap: false
      });
    });
    
    if (onProgress) {
      onProgress(Math.min(99, ((i + cardsPerSlide) / products.length) * 100));
    }
  }
  
  if (onProgress) onProgress(100);
  
  // Download the file directly in browser
  await pres.writeFile({ fileName: `Technohub_Products_${new Date().getTime()}.pptx` });
}
