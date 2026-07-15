import { Card } from "@/components/ui/card";

interface PreviewCardProps {
  product: {
    price: string;
    englishName: string;
    laoName: string;
    barcode: string;
  };
}

export default function PreviewCard({ product }: PreviewCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
      {/* Card Container */}
      <div className="p-0 space-y-0">
        {/* Logo Area - Technohub Logo */}
        <div className="h-16 bg-white flex items-center justify-center border-b border-blue-300 px-3">
          <div className="text-center">
            <div className="text-xs font-medium text-slate-600 mb-1">เทคโนฮับ</div>
            <div className="text-sm font-bold text-slate-900">TECHNO HUB</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-2">
          {/* Lao Name */}
          <div className="text-sm font-medium text-slate-900 line-clamp-2 min-h-10">
            {product.laoName || "ສິນຄ້າ"}
          </div>

          {/* Price - Red and Bold */}
          <div className="text-2xl font-bold text-red-600 py-1">
            {product.price || "0"} Kip
          </div>

          {/* English Name - Blue */}
          <div className="text-xs text-blue-600 line-clamp-2 min-h-8">
            {product.englishName || "Product Name"}
          </div>

          {/* Barcode */}
          <div className="text-xs text-slate-600 font-mono pt-2 border-t border-slate-200">
            {product.barcode || "123456789"}
          </div>
        </div>
      </div>
    </Card>
  );
}
