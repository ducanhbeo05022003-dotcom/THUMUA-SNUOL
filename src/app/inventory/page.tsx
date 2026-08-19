'use client';

import { useEffect, useState } from 'react';

export default function InventoryPage() {
  const [stock, setStock] = useState<any[]>([]);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const res = await fetch('/api/materials');
    if (res.ok) {
      const materials = await res.json();
      setStock(
        materials.map((m: any) => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          quantity: 1000 + Math.random() * 5000,
        }))
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Kho hàng</h1>
      <p className="text-slate-500 mb-8">Quản lý tồn kho vật tư</p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Vật tư</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ĐVT</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-900 font-bold">
                    {s.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
