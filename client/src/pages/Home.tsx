import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Zap, Grid3x3, Download, ArrowRight, Clock, ShieldCheck } from "lucide-react";

const TECHNOHUB_LOGO = "/techno-hub-logo.jpg";
const EXCEL_LOGO = "/exel.png";

function formatPrice(val: string): string {
  if (!val || val.trim() === "" || val.trim() === "-") return "-";
  if (val.toLowerCase().includes("kip")) return val;
  if (/\d/.test(val)) return `${val.trim()} Kip`;
  return val;
}

// Product Card Component matching the landscape mockup exactly
function ProductCard({
  laoName,
  englishName,
  price,
  barcode,
  image,
}: {
  laoName: string;
  englishName: string;
  price: string;
  barcode: string;
  image: string;
}) {
  return (
    <div className="bg-white border border-slate-300 rounded-md flex flex-col aspect-[2.2/1] select-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] h-full overflow-hidden hover:shadow-md transition-shadow">
      {/* Top section: Logo */}
      <div className="px-3 pt-2 pb-1.5 flex items-center justify-start">
        <img
          src={TECHNOHUB_LOGO}
          alt="TECHNO HUB"
          className="w-auto h-auto max-h-[16px] object-contain object-left"
        />
      </div>

      {/* Blue line separator */}
      <div className="h-[2px] bg-[#2563EB] w-full" />

      {/* Product Content Section */}
      <div className="flex-1 flex flex-col p-3 pb-2 pt-2">
        
        {/* Main Body (Text Left, Image Right) */}
        <div className="flex-1 flex gap-2">
          {/* Left Text */}
          <div className="flex-1 flex flex-col">
            <p className="text-[11px] font-bold text-[#2563EB] line-clamp-1 leading-tight text-left mb-1">
              {laoName}
            </p>
            <p className="text-[9px] text-slate-500 line-clamp-2 leading-snug text-left">
              {englishName}
            </p>
          </div>
          
          {/* Right Image Space (Ready for thumbnails) */}
          <div className="w-[40%] h-full flex flex-col items-center justify-center shrink-0 border border-slate-100 rounded p-1 bg-white">
             <img src={image} alt="product" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Bottom Section: Barcode and Price */}
        <div className="w-full flex justify-between items-end mt-1">
          <p className="text-[8px] text-slate-400 leading-none truncate max-w-[50%]">
            Code: {barcode}
          </p>
          <p className="text-[14px] font-extrabold text-[#E11D48] leading-none tracking-tight whitespace-nowrap">
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
      laoName: "BlackKB903 | HAVIT",
      englishName: "Gaming Keyboard | RGB Backlight | Blue Switch",
      price: formatPrice("885,000"),
      barcode: "KB903BK",
      image: "/keboard1.png",
    },
    {
      laoName: "iBoyJootMG102 | HAVIT",
      englishName: "Gaming Mouse | Macro | RGB Light",
      price: formatPrice("471,000"),
      barcode: "MG102BK",
      image: "/Mouse1.png",
    },
    {
      laoName: "PinkKB904 | HAVIT",
      englishName: "Gaming Keyboard | RGB Backlight | Red Switch",
      price: formatPrice("950,000"),
      barcode: "KB904PK",
      image: "/keboard2.png",
    },
    {
      laoName: "ProMouseM22 | HAVIT",
      englishName: "Wireless Gaming Mouse | 12000 DPI | Superlight",
      price: formatPrice("550,000"),
      barcode: "M22SL",
      image: "/Mouse2.png",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent relative z-10 font-sans">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={TECHNOHUB_LOGO}
              alt="TECHNO HUB"
              className="h-7 object-contain"
            />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              PPTX Generator
            </h1>
          </div>
          <Button
            onClick={() => navigate("/generator")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium shadow-md shadow-blue-600/20"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-[3.5rem] leading-[1.15] font-extrabold text-slate-800 mb-6 tracking-tight">
              Create Beautiful <br/>
              <span className="text-blue-600">Product Cards</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md font-medium leading-relaxed">
              Transform your Excel data into stunning Technohub-branded presentations in just a few clicks.
            </p>
            <Button
              onClick={() => navigate("/generator")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-base font-semibold shadow-lg shadow-blue-600/30 gap-2 mb-10"
            >
              Start Now <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Feature List under button */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                No login required
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Generate in seconds
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Secure & Private
              </div>
            </div>
          </div>

          {/* Right Graphic Content */}
          <div className="relative h-[400px] hidden lg:flex items-center justify-center">
            {/* 3D-like Mockup Cards */}
            <div className="relative w-full max-w-[500px] aspect-[16/10] bg-white rounded-xl shadow-[0_20px_50px_rgba(37,99,235,0.15)] border border-slate-100 flex items-stretch overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Fake Slide Content */}
              <div className="flex-1 flex">
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <img src={TECHNOHUB_LOGO} alt="logo" className="h-6 object-left object-contain mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Wireless Mouse</h3>
                  <p className="text-slate-500 font-medium mb-6 text-sm">M546</p>
                  
                  <ul className="text-[12px] text-slate-600 space-y-2 mb-8 font-medium">
                    <li className="flex items-center gap-2">• 2.4GHz Wireless</li>
                    <li className="flex items-center gap-2">• 1600 DPI Optical Sensor</li>
                    <li className="flex items-center gap-2">• Ergonomic Design</li>
                    <li className="flex items-center gap-2">• Long Battery Life</li>
                  </ul>
                  
                  <div className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-md self-start shadow-md text-sm">
                    185,000 Kip
                  </div>
                </div>
                <div className="w-[45%] bg-blue-600 relative flex items-center justify-center p-4" style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-90"></div>
                  <img src="/Mouse1.png" alt="mouse" className="w-full h-auto z-10 transform scale-125" />
                </div>
              </div>
            </div>
            
            {/* Background floating elements */}
            <div className="absolute top-10 right-4 w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center z-20 animate-bounce" style={{animationDuration: "3s"}}>
              <img src={EXCEL_LOGO} alt="Excel" className="w-7 h-7" />
            </div>
            <div className="absolute -z-10 top-0 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -z-10 bottom-10 right-20 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: "2s"}}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[1400px] mx-auto px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Lightning Fast</h3>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Generate presentations with hundreds of products in just seconds
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Grid3x3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Smart Mapping</h3>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Easily map your Excel columns to product fields with live preview
            </p>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">One Click Download</h3>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Download your PPTX file instantly after generation completes
            </p>
          </Card>
        </div>
      </section>

      {/* Example Cards Section */}
      <section className="max-w-[1400px] mx-auto px-8 py-16 relative z-10">
        <div className="mb-10">
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
            Here's What Your Cards Will Look Like
          </h3>
          <p className="text-slate-500 font-medium">
            Each slide contains a 4-column grid of beautifully formatted Technohub product cards
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-20">
          {sampleProducts.map((product, idx) => (
            <ProductCard key={idx} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
