import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Zap, Grid3x3, Download } from "lucide-react";

const TECHNOHUB_LOGO = "/techno-hub-logo.jpg";

function formatPrice(val: string): string {
  if (!val || val.trim() === "" || val.trim() === "-") return "-";
  if (val.toLowerCase().includes("kip")) return val;
  if (/\d/.test(val)) return `${val.trim()} Kip`;
  return val;
}

// Sample product card component
function ProductCard({
  laoName,
  englishName,
  price,
  barcode,
}: {
  laoName: string;
  englishName: string;
  price: string;
  barcode: string;
}) {
  return (
    <div className="bg-white border-2 border-slate-900 rounded-none flex flex-col justify-between aspect-[1.75/1] select-none shadow-sm h-full overflow-hidden">
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

export default function Home() {
  const [, navigate] = useLocation();

  const sampleProducts = [
    {
      laoName: "ຄີບອດKB903L [HAVIT]",
      englishName: "Gaming Keyboard KB903L Black [HAVIT]",
      price: formatPrice("885,000"),
      barcode: "6939119022815",
    },
    {
      laoName: "ເຄື່ອງນວດMG102 [HAVIT]",
      englishName: "Mini Massage Gun MG102 [HAVIT]",
      price: formatPrice("471,000"),
      barcode: "6939119049058",
    },
    {
      laoName: "ຫູຟັງWB01 [HAVIT]",
      englishName: "Wireless Headphones WB01 [HAVIT]",
      price: formatPrice("299,000"),
      barcode: "6939119033445",
    },
    {
      laoName: "ເມົາສ໌HV-MS745 [HAVIT]",
      englishName: "Wireless Mouse HV-MS745 [HAVIT]",
      price: formatPrice("185,000"),
      barcode: "6939119022808",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={TECHNOHUB_LOGO}
              alt="TECHNO HUB"
              className="h-8 object-contain"
            />
            <h1 className="text-xl font-bold text-slate-900">
              PPTX Generator
            </h1>
          </div>
          <Button
            onClick={() => navigate("/generator")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Create Beautiful Product Cards
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Transform your Excel data into stunning Technohub-branded
          </p>
          <Button
            onClick={() => navigate("/generator")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Start Now
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Lightning Fast</h3>
            </div>
            <p className="text-slate-600">
              Generate presentations with hundreds of products in just seconds
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Smart Mapping</h3>
            </div>
            <p className="text-slate-600">
              Easily map your Excel columns to product fields with live preview
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">One Click Download</h3>
            </div>
            <p className="text-slate-600">
              Download your PPTX file instantly after generation completes
            </p>
          </Card>
        </div>

        {/* Example Cards Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">
            Here's What Your Cards Will Look Like
          </h3>
          <p className="text-slate-600 mb-8">
            Each slide contains a 4-column grid of beautifully formatted Technohub product cards
          </p>

          {/* Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleProducts.map((product, idx) => (
              <ProductCard key={idx} {...product} />
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Upload Excel</h4>
              <p className="text-slate-600 text-sm">
                Drag and drop your Excel file with product data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Map Columns</h4>
              <p className="text-slate-600 text-sm">
                Select which columns contain price, name, and barcode
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Download PPTX</h4>
              <p className="text-slate-600 text-sm">
                Get your formatted PowerPoint file ready to print
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/generator")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Create Your First Presentation
          </Button>
        </div>
      </section>
    </div>
  );
}
