import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ProductData {
  laoName: string;
  englishName: string;
  price: string;
  barcode: string;
}

/**
 * Generate a PPTX file from product data using a Python script.
 * Returns the file path where the PPTX was saved.
 */
export async function generatePPTX(products: ProductData[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "generate_pptx.py");
    const tmpDir = os.tmpdir();
    const outputFile = path.join(tmpDir, `technohub_${Date.now()}.pptx`);
    const inputFile = path.join(tmpDir, `input_${Date.now()}.json`);

    // Write input data to temp file
    fs.writeFileSync(inputFile, JSON.stringify(products, null, 2));

    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const python = spawn(pythonCommand, [pythonScript, inputFile, outputFile]);

    let stderr = "";
    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      // Clean up input file
      try {
        fs.unlinkSync(inputFile);
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else if (!fs.existsSync(outputFile)) {
        reject(new Error("PPTX file was not created"));
      } else {
        resolve(outputFile);
      }
    });

    python.on("error", (err) => {
      reject(err);
    });
  });
}

