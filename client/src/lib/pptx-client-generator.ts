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

export async function generatePPTXClient(products: ProductData[], onProgress?: (pct: number) => void) {
  const pres = new PptxGenJS();
  
  const slideWidth = e2i(10691813);
  const slideHeight = e2i(7559675);
  pres.defineLayout({ name: 'CUSTOM', width: slideWidth, height: slideHeight });
  pres.layout = 'CUSTOM';
  
  const cardW = e2i(2554041);
  const cardH = e2i(1459469);
  const cols = 4;
  const rows = 5;
  const cardsPerSlide = cols * rows;
  const marginL = e2i(266700);
  const marginT = e2i(190914);
  
  // Specs for internal placement (matches python version exactly)
  const logoW = e2i(2414041);
  const logoH = e2i(460000);
  const logoL = e2i(70000);
  const logoT = e2i(40000);
  
  const lineW = e2i(2554041);
  const lineH = e2i(60000);
  const lineL = e2i(0);
  const lineT = e2i(520000);
  
  const nameL = e2i(70000);
  const nameT = e2i(650000);
  const nameW = e2i(2414041);
  const nameH = e2i(380000);
  
  const priceL = e2i(1000000);
  const priceT = e2i(1100000);
  const priceW = e2i(1484041);
  const priceH = e2i(280000);
  
  const barcodeL = e2i(70000);
  const barcodeT = e2i(1280000);
  const barcodeW = e2i(1000000);
  const barcodeH = e2i(150000);

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
