
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, FileText, Info, AlertCircle, Loader2, AlertTriangle, CheckCircle2, User, Phone, Printer, Share2 } from 'lucide-react';
import { CanalSection, CanalType, CalculationResult } from './types';
import Visualizer from './components/Visualizer';
import { generateEngineeringReport } from './services/geminiService';

const App: React.FC = () => {
  const [sections, setSections] = useState<CanalSection[]>([
    {
      id: '1',
      name: 'Đoạn kênh chính 01',
      type: CanalType.TRAPEZOIDAL,
      length: 100,
      bottomWidth: 2.0,
      canalDepth: 1.5,
      siltDepth: 0.4,
      sideSlope: 1.0,
      unitPrice: 45000,
    }
  ]);

  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const results = useMemo((): CalculationResult[] => {
    return sections.map(s => {
      let topWidth = s.bottomWidth;
      let averageWidth = s.bottomWidth;
      let areaSilt = 0;
      let areaCanal = 0;

      if (s.type === CanalType.TRAPEZOIDAL) {
        topWidth = s.bottomWidth + 2 * s.sideSlope * s.siltDepth;
        averageWidth = (s.bottomWidth + topWidth) / 2;
        areaSilt = averageWidth * s.siltDepth;
        const topWidthCanal = s.bottomWidth + 2 * s.sideSlope * s.canalDepth;
        areaCanal = ((s.bottomWidth + topWidthCanal) / 2) * s.canalDepth;
      } else {
        topWidth = s.bottomWidth;
        averageWidth = s.bottomWidth;
        areaSilt = s.bottomWidth * s.siltDepth;
        areaCanal = s.bottomWidth * s.canalDepth;
      }
      
      const volumeSilt = areaSilt * s.length;
      const volumeCanal = areaCanal * s.length;
      const cost = volumeSilt * s.unitPrice;
      
      return { 
        topWidth, 
        averageWidth, 
        crossSectionArea: areaSilt, 
        totalVolume: volumeSilt, 
        canalVolume: volumeCanal,
        siltDepthRatio: s.canalDepth > 0 ? (s.siltDepth / s.canalDepth) * 100 : 0,
        siltVolumeRatio: volumeCanal > 0 ? (volumeSilt / volumeCanal) * 100 : 0,
        totalCost: cost 
      };
    });
  }, [sections]);

  const totalAllVolume = results.reduce((acc, curr) => acc + curr.totalVolume, 0);
  const totalAllCost = results.reduce((acc, curr) => acc + curr.totalCost, 0);

  const addSection = () => {
    const newSection: CanalSection = {
      id: Date.now().toString(),
      name: `Đoạn mới ${sections.length + 1}`,
      type: CanalType.TRAPEZOIDAL,
      length: 100,
      bottomWidth: 2.0,
      canalDepth: 1.5,
      siltDepth: 0.1,
      sideSlope: 1.0,
      unitPrice: 45000,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: keyof CanalSection, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const getStatusColor = (ratio: number) => {
    if (ratio >= 50) return 'text-red-600 bg-red-50 border-red-100';
    if (ratio >= 25) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getStatusIcon = (ratio: number) => {
    if (ratio >= 50) return <AlertCircle size={16} />;
    if (ratio >= 25) return <AlertTriangle size={16} />;
    return <CheckCircle2 size={16} />;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await generateEngineeringReport(sections, results);
      setAiReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-12 text-slate-900 font-sans print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .section-card { break-inside: avoid; border: 1px solid #e2e8f0 !important; margin-bottom: 2rem; }
          header { background: black !important; color: white !important; -webkit-print-color-adjust: exact; }
          .bg-slate-900 { background: #0f172a !important; color: white !important; }
          .text-blue-400 { color: #3b82f6 !important; }
          .text-emerald-400 { color: #10b981 !important; }
        }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden print:rounded-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 no-print"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tight">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-500/20 no-print">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            Quản Lý Nạo Vét Kênh Mương
          </h1>
          <p className="text-slate-400 mt-2 font-medium max-w-md">Báo cáo kỹ thuật tính toán khối lượng bồi lắng và kinh phí nạo vét.</p>
          
          <div className="mt-4 flex flex-wrap gap-4 items-center text-sm font-bold">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-blue-400">
              <User size={14} />
              Tác giả: <span className="text-white">Văn Chiến</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-emerald-400">
              <Phone size={14} />
              Hotline: <span className="text-white">085.4746837</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/10 min-w-[240px] shadow-inner relative z-10 text-right md:text-left">
          <div className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400 mb-1">Tổng kinh phí dự toán</div>
          <div className="text-3xl font-black text-white">{totalAllCost.toLocaleString('vi-VN')}<span className="text-lg ml-1 text-slate-500 font-normal">đ</span></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between no-print">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
              Cấu hình đoạn kênh
            </h2>
            <button
              onClick={addSection}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 font-bold active:scale-95"
            >
              <Plus size={18} /> Thêm đoạn mới
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => {
              const res = results[index];
              return (
                <div key={section.id} className="section-card bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Form Inputs */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                            className="text-2xl font-black text-slate-900 focus:outline-none bg-transparent flex-1 border-none focus:ring-0 placeholder-slate-300 print:text-xl"
                            placeholder="Tên đoạn kênh..."
                          />
                          <button 
                            onClick={() => removeSection(section.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all no-print"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Mặt cắt</label>
                            <select
                              value={section.type}
                              onChange={(e) => updateSection(section.id, 'type', e.target.value as CanalType)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer print:border-none print:bg-white print:px-0"
                            >
                              <option value={CanalType.TRAPEZOIDAL}>Hình thang</option>
                              <option value={CanalType.RECTANGULAR}>Hình hộp</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Chiều dài (m)</label>
                            <input
                              type="number"
                              value={section.length}
                              onChange={(e) => updateSection(section.id, 'length', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all print:bg-white print:border-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">b_đáy (m)</label>
                            <input
                              type="number"
                              value={section.bottomWidth}
                              onChange={(e) => updateSection(section.id, 'bottomWidth', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all print:bg-white print:border-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                          <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 print:bg-white">
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 tracking-wider text-center">H_kênh thiết kế (m)</label>
                            <input
                              type="number"
                              value={section.canalDepth}
                              onChange={(e) => updateSection(section.id, 'canalDepth', Number(e.target.value))}
                              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-blue-500 outline-none shadow-sm print:border-none"
                            />
                          </div>
                          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 print:bg-white">
                            <label className="block text-[10px] font-black text-amber-600 uppercase mb-1.5 tracking-wider text-center">h_bồi hiện trạng (m)</label>
                            <input
                              type="number"
                              value={section.siltDepth}
                              onChange={(e) => updateSection(section.id, 'siltDepth', Number(e.target.value))}
                              className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-amber-500 outline-none shadow-sm print:border-none"
                            />
                          </div>
                          {section.type === CanalType.TRAPEZOIDAL && (
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 print:bg-white">
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-wider text-center">Hệ số mái m</label>
                              <input
                                type="number"
                                step="0.1"
                                value={section.sideSlope}
                                onChange={(e) => updateSection(section.id, 'sideSlope', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-blue-500 outline-none print:border-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* THÔNG SỐ TRUNG GIAN (HIỂN THỊ ĐỂ VIẾT BIÊN BẢN) */}
                        <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-2xl relative overflow-hidden group print:bg-black print:text-white">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform no-print"></div>
                          <div className="flex items-center gap-2 mb-4">
                            <Info size={16} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông số tính toán chi tiết (Dùng cho biên bản)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                              <div className="text-[10px] text-slate-500 uppercase font-black">Bề rộng mặt bồi (b_mặt)</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{section.bottomWidth} + 2×{section.sideSlope}×{section.siltDepth} =</span>
                                <span className="text-xl font-black text-blue-400 tracking-tight">{res.topWidth.toFixed(3)}m</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] text-blue-400 uppercase font-black">Bề rộng trung bình (b_tb)</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">({section.bottomWidth} + {res.topWidth.toFixed(3)})/2 =</span>
                                <span className="text-2xl font-black text-emerald-400 tracking-tight underline decoration-emerald-400/20 underline-offset-8">{res.averageWidth.toFixed(3)}m</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 no-print">
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Đơn giá nạo vét (VNĐ/m³)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={section.unitPrice}
                              onChange={(e) => updateSection(section.id, 'unitPrice', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-4 text-blue-700 font-black text-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</div>
                          </div>
                        </div>
                      </div>

                      {/* Visualizer and Results Summary */}
                      <div className="w-full md:w-80 space-y-6">
                        <Visualizer 
                          type={section.type} 
                          b={section.bottomWidth} 
                          h_silt={section.siltDepth} 
                          H_canal={section.canalDepth}
                          m={section.sideSlope} 
                        />
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 relative overflow-hidden print:bg-white print:border-slate-300">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 border-b border-slate-200 pb-3 text-center">Kết quả đo đạc</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-bold italic">Diện tích bồi (A_b):</span>
                              <span className="text-sm font-black text-slate-800">{res.crossSectionArea.toFixed(3)} m²</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm print:shadow-none print:border-slate-300">
                              <span className="text-xs text-slate-500 font-bold italic">Thể tích (V_b):</span>
                              <span className="text-xl font-black text-blue-700">{res.totalVolume.toLocaleString('vi-VN')} m³</span>
                            </div>
                            <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 no-print">
                              <span className="text-xs text-emerald-700 font-black">Thành tiền:</span>
                              <span className="text-lg font-black text-emerald-700">{res.totalCost.toLocaleString('vi-VN')} đ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Summaries & AI */}
        <div className="space-y-6 no-print">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <Calculator size={24} className="text-blue-600" />
              Tổng quan
            </h2>
            
            <div className="space-y-5 mb-8">
              <div className="p-6 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">m³</div>
                <div>
                  <div className="text-[10px] text-blue-600 uppercase font-black tracking-widest">Tổng bùn nạo vét</div>
                  <div className="text-2xl font-black text-slate-900">{totalAllVolume.toLocaleString('vi-VN')}</div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">đ</div>
                <div>
                  <div className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Tổng kinh phí</div>
                  <div className="text-2xl font-black text-slate-900">{totalAllCost.toLocaleString('vi-VN')}</div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-[1.5rem] font-black transition-all shadow-md active:scale-95"
              >
                <Printer size={20} /> IN BIÊN BẢN / PDF
              </button>
              
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || sections.length === 0}
                className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 text-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={22} />}
                XUẤT BÁO CÁO AI
              </button>

              {aiReport && (
                <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm text-slate-800 leading-relaxed max-h-[400px] overflow-y-auto shadow-inner">
                  <div className="flex items-center gap-2 text-blue-700 font-black mb-4 uppercase text-[10px] tracking-[0.2em] border-b border-blue-100 pb-3">
                    <Info size={14} /> Chẩn đoán kỹ thuật bởi AI
                  </div>
                  <div className="whitespace-pre-wrap font-medium">
                    {aiReport}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4 print:mt-4 print:border-none">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            Tác giả: <span className="text-slate-900">Văn Chiến</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full hidden md:block no-print"></div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            Điện thoại: <span className="text-slate-900">085.4746837</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] pb-8">
          &copy; 2025 PHẦN MỀM KỸ THUẬT THỦY LỢI CHUYÊN DỤNG - VĂN CHIẾN
        </p>
      </footer>
    </div>
  );
};

export default App;
