'use client';

import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

interface Contract {
  id: string;
  code: string;
  company?: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  createdAt: string;
  supplier: { name: string };
}

const COMPANY_LABEL: Record<string, string> = {
  BP: 'BP',
  ERC: 'ERC',
  SV: 'SV',
};

export default function QuotesPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/contracts')
      .then((r) => (r.ok ? r.json() : []))
      .then(setContracts)
      .finally(() => setLoading(false));
  }, []);

  const companies = Array.from(new Set(contracts.map((c) => c.company).filter(Boolean))) as string[];

  const filtered = contracts.filter((c) => {
    if (companyFilter && c.company !== companyFilter) return false;
    if (companyFilter === '__none__' && c.company) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.supplier.name.toLowerCase().includes(q) || c.fileName?.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by supplier for nicer browsing
  const bySupplier = new Map<string, Contract[]>();
  filtered.forEach((c) => {
    const key = c.supplier.name;
    if (!bySupplier.has(key)) bySupplier.set(key, []);
    bySupplier.get(key)!.push(c);
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo giá & Hợp đồng</h1>
        <p className="text-slate-500 text-sm mt-1">Hợp đồng đã ký với nhà cung cấp · xem và tải file gốc</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <button
            onClick={() => setCompanyFilter('')}
            className={`px-2.5 py-1 rounded-lg font-medium ${companyFilter === '' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Tất cả
          </button>
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setCompanyFilter(c)}
              className={`px-2.5 py-1 rounded-lg font-medium ${companyFilter === c ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {COMPANY_LABEL[c] || c}
            </button>
          ))}
          <button
            onClick={() => setCompanyFilter('__none__')}
            className={`px-2.5 py-1 rounded-lg font-medium ${companyFilter === '__none__' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Chung
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm nhà cung cấp hoặc tên file..."
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-64"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-sm">
          Đang tải...
        </div>
      ) : bySupplier.size === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-sm">
          Chưa có hợp đồng nào
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(bySupplier.entries()).map(([supplierName, list]) => (
            <div key={supplierName} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">{supplierName}</h3>
                <span className="text-xs text-slate-400">{list.length} hợp đồng</span>
              </div>
              <div className="divide-y divide-slate-100">
                {list.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-md" title={c.fileName}>
                          {c.fileName || c.code}
                        </p>
                        <p className="text-xs text-slate-400">
                          {c.company ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold mr-1.5">
                              {COMPANY_LABEL[c.company] || c.company}
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold mr-1.5">
                              Chung
                            </span>
                          )}
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    {c.fileUrl && (
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Xem / Tải
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
