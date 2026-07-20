import { useState, useCallback, useMemo } from "react";
import { Upload, Loader2, ArrowLeft, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import ColumnMappingUI from "@/components/ColumnMappingUI";
import { useLocation } from "wouter";
import { generatePPTXClient } from "@/lib/pptx-client-generator";

const TECHNOHUB_LOGO = "/techno-hub-logo.jpg";

function formatPrice(val: string): string {
  if (!val || val.trim() === "" || val.trim() === "-") return "-";
  if (val.toLowerCase().includes("kip")) return val;
  if (/\d/.test(val)) return `${val.trim()} Kip`;
  return val;
}

interface ParsedData {
  headers: string[];
  columnLetters: string[];
  rows: Record<string, string>[];
}

interface ColumnMapping {
  price: string;
  englishName: string;
  laoName: string;
  barcode: string;
}

// Product Card Component - matches template exactly
function ProductCard({
  laoName,
  englishName,
  price,
  barcode,
  tagMode = "standard",
}: {
  laoName: string;
  englishName: string;
  price: string;
  barcode: string;
  tagMode?: "standard" | "long";
}) {
  return (
    <div className={`bg-white border-2 border-slate-900 rounded-none flex flex-col justify-between select-none shadow-sm h-full overflow-hidden ${tagMode === "long" ? "aspect-[2.54/1]" : "aspect-[1.75/1]"
      }`}>
      {/* Top section: Logo */}
      <div className="px-2 pt-2 pb-1.5 flex items-center justify-start">
        <img
          src={TECHNOHUB_LOGO}
          alt="TECHNO HUB"
          className="w-full h-auto max-h-[52px] object-contain object-left"
        />
      </div>

      {/* Blue line separator */}
      <div className="h-[4px] bg-[#4472C4] w-full" />

      {/* Product Content Section */}
      <div className="flex-1 flex flex-col justify-between px-2.5 pb-2 pt-1">
        {/* Names */}
        <div className="flex flex-col gap-0">
          <p className="text-[12px] font-bold text-slate-900 line-clamp-1 leading-tight text-left">
            {laoName}
          </p>
          <p className="text-[9.5px] text-[#6499DE] line-clamp-1 leading-tight text-left">
            {englishName}
          </p>
        </div>

        {/* Bottom Section: Barcode and Price */}
        <div className="relative w-full h-[32px] mt-auto">
          <p className="absolute bottom-0 left-0 text-[9px] text-slate-800 leading-none truncate max-w-[60%]">
            {barcode}
          </p>
          <p className="absolute bottom-1 right-0 text-[18px] font-extrabold text-[#FF0000] leading-none tracking-tight whitespace-nowrap">
            {price}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert column index to letter
function getColumnLetter(index: number): string {
  let letter = "";
  let num = index + 1;
  while (num > 0) {
    num--;
    letter = String.fromCharCode(65 + (num % 26)) + letter;
    num = Math.floor(num / 26);
  }
  return letter;
}

// Best-effort auto-guess of which column matches which field, based on header text.
// Real-world sheets (Korean/Lao/English mixed workbooks) rarely have identical
// header names, so this just saves the user a few clicks — it never blocks manual override.
function guessColumnMapping(
  headers: string[],
  columnLetters: string[]
): Partial<ColumnMapping> {
  const norm = (s: string) => s.toLowerCase().trim();
  const find = (patterns: RegExp[]) => {
    for (const pattern of patterns) {
      const idx = headers.findIndex((h) => pattern.test(norm(h)));
      if (idx !== -1) return columnLetters[idx];
    }
    return undefined;
  };

  return {
    barcode: find([/barcode/, /바코드/]),
    price: find([/^price$/, /\bprice\b/, /가격/, /단가/]),
    englishName: find([/english/, /eng.?name/, /영문/]),
    laoName: find([/lao/, /라오/]),
  };
}

export default function Generator() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<
    "upload" | "sheet" | "inspect" | "mapping" | "preview"
  >("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(
    null
  );
  const [suggestedMapping, setSuggestedMapping] = useState<
    Partial<ColumnMapping>
  >({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingSheet, setIsParsingSheet] = useState(false);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetSearch, setSheetSearch] = useState("");
  const [previewPage, setPreviewPage] = useState(0);
  const [tagMode, setTagMode] = useState<"standard" | "long">("standard");

  const generateMutation = trpc.pptx.generate.useMutation();

  const parseSheetData = useCallback((wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet || !worksheet["!ref"]) {
      toast.error(`Sheet "${sheetName}" is empty`);
      setIsParsingSheet(false);
      return;
    }

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    console.group(`📊 [ExcelDebug] Sheet: "${sheetName}"`);
    console.log(
      "Range:",
      worksheet["!ref"],
      `→ ${range.e.r + 1} rows × ${range.e.c + 1} cols`
    );

    // Read cell by cell — picks up formula cached values (.v first, then .w)
    const extractCell = (r: number, c: number): string => {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[addr];
      if (!cell) return "";
      if (cell.t === "z") return ""; // stub cell

      // 1. Numbers: prefer the formatted string (.w) to avoid float precision
      //    and scientific-notation issues (barcodes, prices, etc). Fall back
      //    to the raw value only if no format string exists.
      if (typeof cell.v === "number") {
        if (cell.w !== undefined && cell.w !== "") return cell.w;
        // Avoid scientific notation for large integers like barcodes
        return Number.isInteger(cell.v)
          ? cell.v.toFixed(0)
          : String(cell.v);
      }
      // 2. Non-numeric raw value .v
      if (cell.v !== undefined && cell.v !== null && cell.v !== "") {
        return String(cell.v);
      }
      // 3. Formatted string .w
      if (cell.w !== undefined && cell.w !== "") return cell.w;
      // 4. Rich text HTML .h — strips tags, handles Lao/Korean/Thai rich text cells
      if (cell.h) {
        const txt = cell.h.replace(/<[^>]*>/g, "").trim();
        if (txt) return txt;
      }
      // 5. Raw rich text .r — XML parse fallback
      if (cell.r) {
        const txt = cell.r.replace(/<[^>]*>/g, "").trim();
        if (txt) return txt;
      }
      return "";
    };

    // Build 2D array
    const rawRows: string[][] = [];
    for (let r = range.s.r; r <= range.e.r; r++) {
      const row: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        row.push(extractCell(r, c));
      }
      rawRows.push(row);
    }

    if (rawRows.length < 2) {
      toast.error("Sheet is empty or has no data rows");
      console.groupEnd();
      setIsParsingSheet(false);
      return;
    }

    const headerRow = rawRows[0];
    const dataRows = rawRows.slice(1);
    const columnLetters = headerRow.map((_, idx) => getColumnLetter(idx));
    // Header display text only — never used as a data key (duplicate headers,
    // e.g. two columns both named "실재고 1차", would silently collide otherwise).
    const headers = headerRow.map((h, idx) => h || columnLetters[idx]);

    console.log("Headers:", headers);
    console.log("Sample rows (first 3):");
    dataRows.slice(0, 3).forEach((row, i) => {
      const obj: Record<string, string> = {};
      columnLetters.forEach((l, c) => {
        obj[`${l}:${headers[c]}`] = row[c];
      });
      console.log(`  Row ${i + 1}:`, obj);
    });

    // Rows are always keyed by column LETTER (A, B, C...) — stable and unique,
    // unlike header text which can be blank or duplicated across columns.
    const rows = dataRows
      .filter((row) => row.some((cell) => cell !== ""))
      .map((row) =>
        Object.fromEntries(
          columnLetters.map((letter, idx) => [letter, row[idx] ?? ""])
        )
      ) as Record<string, string>[];

    // Warn about columns that are entirely empty (helps spot mis-picked sheets/rows)
    columnLetters.forEach((letter, idx) => {
      const allEmpty = rows.every((r) => !r[letter]);
      if (allEmpty) {
        console.warn(`⚠️  Column ${letter} ("${headers[idx]}") is entirely empty`);
      }
    });

    console.log(`Total data rows: ${rows.length}`);
    console.groupEnd();

    if (rows.length === 0) {
      toast.error("Sheet has no data");
      setIsParsingSheet(false);
      return;
    }

    setParsedData({ headers, columnLetters, rows });
    setSuggestedMapping(guessColumnMapping(headers, columnLetters));
    setStep("inspect");
    setPreviewPage(0);

    toast.success(`Loaded ${rows.length} rows — preview below before mapping`);
    setIsParsingSheet(false);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast.error("ไม่สามารถอ่านไฟล์ได้ (ไม่มีข้อมูล)");
          return;
        }
        // Use ArrayBuffer (type:'array') for correct Unicode/UTF-8 handling
        // readAsBinaryString can corrupt Lao/Korean/Thai characters
        const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), {
          type: "array",
          cellFormula: true, // keep formulas so cached values (.v) are preserved
          cellNF: true, // preserve number formats (needed for .w)
          cellDates: true,
          sheetStubs: true, // include stub cells
          cellHTML: true, // generate .h (HTML) for rich text cells
        });

        if (!wb.SheetNames.length) {
          toast.error("ไฟล์นี้ไม่มีชีตข้อมูล");
          return;
        }

        setWorkbook(wb);
        setSelectedSheet(wb.SheetNames[0]);
        setSheetSearch("");
        setStep("sheet");
        toast.success(`Found ${wb.SheetNames.length} sheet(s) in "${file.name}"`);
      } catch (error) {
        // XLSX.read runs inside this async callback, so it MUST be caught here —
        // a try/catch only around reader.readAsArrayBuffer() would never see this.
        toast.error("ไฟล์ Excel เสียหายหรือไม่รองรับ กรุณาตรวจสอบไฟล์อีกครั้ง");
        console.error("XLSX parse error:", error);
      }
    };

    reader.onerror = () => {
      toast.error("เกิดข้อผิดพลาดขณะอ่านไฟล์ กรุณาลองใหม่อีกครั้ง");
      console.error("FileReader error:", reader.error);
    };

    reader.readAsArrayBuffer(file); // ArrayBuffer handles Unicode correctly
  }, []);

  const handleSheetConfirm = useCallback(() => {
    if (!workbook || !selectedSheet) return;
    setIsParsingSheet(true);
    // small delay so spinner renders before heavy parse
    setTimeout(() => parseSheetData(workbook, selectedSheet), 50);
  }, [workbook, selectedSheet, parseSheetData]);

  const isExcelFile = (name: string) => {
    const lower = name.toLowerCase();
    return lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".xlsm");
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && isExcelFile(file.name)) {
        handleFileUpload(file);
      } else {
        toast.error("Please drop an Excel file (.xlsx, .xls or .xlsm)");
      }
    },
    [handleFileUpload]
  );

  const handleMappingSubmit = (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
    setStep("preview");
  };

  const handleGeneratePPTX = async () => {
    if (!parsedData || !columnMapping) return;

    // Rows are keyed by column letter — columnMapping values are also column
    // letters (set by ColumnMappingUI), so this lookup is direct. Do NOT
    // route through header text here (see parseSheetData comment above).
    const missingRequired = ["barcode", "price", "englishName", "laoName"].filter(
      (key) => !columnMapping[key as keyof ColumnMapping]
    );
    if (missingRequired.length > 0) {
      toast.error("กรุณาเลือกคอลัมน์ให้ครบก่อน generate");
      return;
    }

    setIsGenerating(true);
    try {
      const products = parsedData.rows.map((row) => ({
        price: formatPrice(String(row[columnMapping.price] || "")),
        englishName: String(row[columnMapping.englishName] || ""),
        laoName: String(row[columnMapping.laoName] || ""),
        barcode: String(row[columnMapping.barcode] || ""),
      }));

      // Generate PPTX entirely on the client side!
      await generatePPTXClient(products, tagMode, (progress) => {
        // Optional: you could set progress state here if you add a progress bar
        console.log(`Generating: ${progress.toFixed(0)}%`);
      });

      toast.success("PPTX generated and downloaded successfully!");
      setStep("upload");
      setParsedData(null);
      setColumnMapping(null);
      setWorkbook(null);
      setSelectedSheet("");
    } catch (error) {
      toast.error(
        `Failed to generate PPTX: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSheetNames = useMemo(() => {
    if (!workbook) return [];
    if (!sheetSearch.trim()) return workbook.SheetNames;
    const q = sheetSearch.toLowerCase();
    return workbook.SheetNames.filter((name) => name.toLowerCase().includes(q));
  }, [workbook, sheetSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              Technohub<span className="text-blue-600">PPTX</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {step === "sheet" && workbook && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Select Sheet</h2>
            <p className="text-slate-600 mb-6">
              Found <strong>{workbook.SheetNames.length}</strong> sheet(s) — choose which one to use
            </p>

            {workbook.SheetNames.length > 6 && (
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sheetSearch}
                  onChange={(e) => setSheetSearch(e.target.value)}
                  placeholder="ค้นหาชื่อชีต..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-400 focus:outline-none text-sm"
                />
              </div>
            )}

            <Card className="p-8 bg-white">
              <div className="grid gap-3 mb-8 max-h-[420px] overflow-y-auto">
                {filteredSheetNames.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">
                    ไม่พบชีตที่ตรงกับ "{sheetSearch}"
                  </p>
                )}
                {filteredSheetNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedSheet(name)}
                    className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedSheet === name
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                      }`}
                  >
                    <span className="text-lg">📄</span>
                    {name}
                    {selectedSheet === name && (
                      <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSheetConfirm}
                disabled={isParsingSheet || !selectedSheet}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isParsingSheet ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysing Sheet...
                  </>
                ) : (
                  "Inspect this Sheet →"
                )}
              </Button>
            </Card>
          </div>
        )}

        {step === "inspect" && parsedData && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-slate-900">Sheet Inspector</h2>
              <Button variant="outline" size="sm" onClick={() => setStep("sheet")}>
                ← Back
              </Button>
            </div>
            <p className="text-slate-600 mb-6">
              Sheet <strong className="text-blue-600">"{selectedSheet}"</strong> —{" "}
              <strong>{parsedData.rows.length}</strong> data rows ×{" "}
              <strong>{parsedData.columnLetters.length}</strong> columns.
              Verify data below, then proceed to column mapping.
            </p>

            {/* Column Analysis */}
            <Card className="p-6 bg-white mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 Column Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {parsedData.columnLetters.map((letter, idx) => {
                  const header = parsedData.headers[idx];
                  const filled = parsedData.rows.filter(
                    (r) => r[letter] && r[letter] !== ""
                  ).length;
                  const pct = Math.round((filled / parsedData.rows.length) * 100);
                  const sample = parsedData.rows.find((r) => r[letter]);
                  const sampleVal = sample ? String(sample[letter]).slice(0, 30) : "";
                  const isEmpty = pct === 0;
                  return (
                    <div
                      key={letter}
                      className={`p-3 rounded-lg border ${isEmpty
                        ? "border-red-200 bg-red-50"
                        : pct > 50
                          ? "border-green-200 bg-green-50"
                          : "border-yellow-200 bg-yellow-50"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-xs text-slate-500">{letter}</span>
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${isEmpty
                            ? "bg-red-200 text-red-700"
                            : "bg-green-200 text-green-700"
                            }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">{header}</p>
                      {sampleVal && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{sampleVal}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Data Preview Table */}
            <Card className="p-6 bg-white mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                🗂️ Data Preview (first 10 rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse min-w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-200 px-2 py-1.5 text-left text-slate-500 font-medium">
                        #
                      </th>
                      {parsedData.columnLetters.map((letter, idx) => (
                        <th
                          key={letter}
                          className="border border-slate-200 px-2 py-1.5 text-left font-medium text-slate-700 whitespace-nowrap"
                        >
                          <span className="text-blue-500">{letter}</span>{" "}
                          {parsedData.headers[idx] !== letter ? parsedData.headers[idx] : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border border-slate-200 px-2 py-1 text-slate-400">
                          {i + 1}
                        </td>
                        {parsedData.columnLetters.map((letter) => (
                          <td
                            key={letter}
                            className={`border border-slate-200 px-2 py-1 max-w-[150px] truncate ${row[letter] ? "text-slate-700" : "text-slate-300"
                              }`}
                          >
                            {row[letter] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Button
              onClick={() => setStep("mapping")}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Column Mapping →
            </Button>
          </div>
        )}

        {step === "upload" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Excel File</h2>
            <p className="text-slate-600 mb-8">Select an Excel file containing your product data</p>

            <Card
              className="p-12 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="text-center">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Drag and drop your Excel file
                </h3>
                <p className="text-slate-600 mb-6">or click to browse your computer</p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    // allow re-uploading the same filename twice in a row
                    e.target.value = "";
                  }}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  onClick={() => document.getElementById("file-input")?.click()}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Select File
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === "mapping" && parsedData && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Map Your Columns</h2>
            <p className="text-slate-600 mb-8">Select which Excel column contains each product field</p>
            <ColumnMappingUI
              columnLetters={parsedData.columnLetters}
              headers={parsedData.headers}
              sampleRows={parsedData.rows.slice(0, 3)}
              initialMapping={suggestedMapping}
              onSubmit={handleMappingSubmit}
            />
          </div>
        )}

        {step === "preview" && parsedData && columnMapping && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Preview Your Cards</h2>
            <p className="text-slate-600 mb-8">
              This is how your product cards will appear in the PowerPoint presentation
            </p>

            {/* Tag Mode Selector */}
            <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                  <Tag className="w-4 h-4 text-blue-500" /> Tag Type
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Standard = 3 columns/slide &nbsp;|&nbsp; Long Tag = 2 columns/slide
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant={tagMode === "standard" ? "default" : "outline"}
                  onClick={() => { setTagMode("standard"); setPreviewPage(0); }}
                  className={`flex-1 md:flex-none ${tagMode === "standard" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                >
                  Standard Tag
                </Button>
                <Button
                  variant={tagMode === "long" ? "default" : "outline"}
                  onClick={() => { setTagMode("long"); setPreviewPage(0); }}
                  className={`flex-1 md:flex-none ${tagMode === "long" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                >
                  Long Tag
                </Button>
              </div>
            </div>

            {/* Card Grid Preview with Pagination */}
            {(() => {
              const PAGE_SIZE = tagMode === "standard" ? 12 : 8;
              const totalPages = Math.ceil(parsedData.rows.length / PAGE_SIZE);
              const pageRows = parsedData.rows.slice(
                previewPage * PAGE_SIZE,
                (previewPage + 1) * PAGE_SIZE
              );
              return (
                <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border border-slate-200">
                  {/* Page header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <p className="text-sm text-slate-500">
                      Slide <strong className="text-slate-800">{previewPage + 1}</strong> of{" "}
                      <strong className="text-slate-800">{totalPages}</strong>{" "}
                      &nbsp;·&nbsp; {parsedData.rows.length} items ({tagMode === "standard" ? "3" : "2"} cols/slide)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={previewPage === 0}
                        onClick={() => setPreviewPage((p) => p - 1)}
                      >
                        ← Prev
                      </Button>
                      <span className="text-sm text-slate-500 px-1">
                        {previewPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={previewPage >= totalPages - 1}
                        onClick={() => setPreviewPage((p) => p + 1)}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className={`grid gap-6 ${tagMode === "standard" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                    {pageRows.map((row, idx) => (
                      <ProductCard
                        key={previewPage * PAGE_SIZE + idx}
                        price={formatPrice(String(row[columnMapping.price] || "0"))}
                        englishName={String(row[columnMapping.englishName] || "Product")}
                        laoName={String(row[columnMapping.laoName] || "ສິນຄ້າ")}
                        barcode={String(row[columnMapping.barcode] || "123456")}
                        tagMode={tagMode}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={() => setStep("mapping")} variant="outline" size="lg">
                Back to Mapping
              </Button>
              <Button
                onClick={handleGeneratePPTX}
                disabled={isGenerating}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PPTX...
                  </>
                ) : (
                  <>Generate & Download PPTX ({tagMode === "standard" ? "Standard Tag" : "Long Tag"})</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}