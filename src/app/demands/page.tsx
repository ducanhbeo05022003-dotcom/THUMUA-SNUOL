'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function DemandsPage() {
  const [quantity, setQuantity] = useState(100);
  const [results, setResults] = useState<any[]>([]);

  const handleCalculate = async () => {
    // Fetch materials and calculate demands
    const res = await fetch('/api/materials');
    if (res.ok) {
      const materials = await res.json();
      const calcs = materials.slice(0, 5).map((m: any) => ({
        name: m.name,
        unit: m.unit,
        quantity: (m.norm || 0) * quantity,
      }));
      setResults(calcs);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Nhu cầu vật tư</h1>
        <p className="text-slate-500">Tính toán nhu cầu dựa trên định mức</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số lượng cây/sản lượng
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCalculate}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <Calculator className="w-4 h-4" />
            Tính nhu cầu
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Vật tư</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Số lượng cần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-bold">
                      {r.quantity.toLocaleString('vi-VN')} {r.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
