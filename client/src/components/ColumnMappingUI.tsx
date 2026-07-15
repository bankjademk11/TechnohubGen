import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ColumnMappingUIProps {
  columnLetters: string[];
  headers: string[];
  sampleRows: Record<string, string>[];
  initialMapping?: Partial<{
    price: string;
    englishName: string;
    laoName: string;
    barcode: string;
  }>;
  onSubmit: (mapping: {
    price: string;
    englishName: string;
    laoName: string;
    barcode: string;
  }) => void;
}

export default function ColumnMappingUI({
  columnLetters,
  headers,
  sampleRows,
  initialMapping = {},
  onSubmit,
}: ColumnMappingUIProps) {
  const [mapping, setMapping] = useState({
    price: initialMapping.price ?? "",
    englishName: initialMapping.englishName ?? "",
    laoName: initialMapping.laoName ?? "",
    barcode: initialMapping.barcode ?? "",
  });

  const handleSubmit = () => {
    if (!mapping.price || !mapping.englishName || !mapping.laoName || !mapping.barcode) {
      toast.error("Please map all four columns");
      return;
    }

    if (
      new Set([mapping.price, mapping.englishName, mapping.laoName, mapping.barcode]).size !== 4
    ) {
      toast.error("Each column must be mapped to a different field");
      return;
    }

    onSubmit(mapping);
  };

  const fields = [
    { key: "price", label: "Price", description: "Column containing product price" },
    { key: "englishName", label: "English Name", description: "Product name in English" },
    { key: "laoName", label: "Lao Name", description: "Product name in Lao" },
    { key: "barcode", label: "Barcode", description: "Product barcode/SKU" },
  ];

  return (
    <div className="space-y-8">
      {/* Mapping Selection */}
      <Card className="p-6 bg-white">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Map Your Columns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  {field.label}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {field.description}
                </span>
              </label>
              <Select
                value={mapping[field.key as keyof typeof mapping]}
                onValueChange={(value) =>
                  setMapping((prev) => ({
                    ...prev,
                    [field.key]: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  {columnLetters.map((letter, idx) => (
                    <SelectItem key={letter} value={letter}>
                      {letter} — {headers[idx] || `Column ${letter}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {/* Sample Data Preview */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Sample Data Preview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-slate-700">
                  Price
                </th>
                <th className="text-left py-2 px-3 font-medium text-slate-700">
                  English Name
                </th>
                <th className="text-left py-2 px-3 font-medium text-slate-700">
                  Lao Name
                </th>
                <th className="text-left py-2 px-3 font-medium text-slate-700">
                  Barcode
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-600">
                    {mapping.price ? row[mapping.price] || "-" : "-"}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {mapping.englishName ? row[mapping.englishName] || "-" : "-"}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {mapping.laoName ? row[mapping.laoName] || "-" : "-"}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {mapping.barcode ? row[mapping.barcode] || "-" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Continue to Preview
      </Button>
    </div>
  );
}
