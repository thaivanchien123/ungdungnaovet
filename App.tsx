
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, FileText, Info, AlertCircle, Loader2, AlertTriangle, CheckCircle2, User, Phone } from 'lucide-react';
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
        // Bồi lắng
        topWidth = s.bottomWidth + 2 * s.sideSlope * s.siltDepth;
        averageWidth = (s.bottomWidth + topWidth) / 2;
        areaSilt = averageWidth * s.siltDepth;

        // Thiết kế kênh tổng thể
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-12 text-slate-900 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tight">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-500/20">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            Quản Lý Nạo Vét Kênh Mương
          </h1>
          <p className="text-slate-400 mt-2 font-medium max-w-md">Hỗ trợ kỹ sư thủy lợi tính toán B_tb và khối lượng bồi lắng chuyên sâu.</p>
          
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
        
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/10 min-w-[240px] shadow-inner relative z-10">
          <div className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400 mb-1">Tổng kinh phí dự toán</div>
          <div className="text-3xl font-black text-white">{totalAllCost.toLocaleString('vi-VN')}<span className="text-lg ml-1 text-slate-500 font-normal">đ</span></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
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
                <div key={section.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Form Inputs */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                            className="text-2xl font-black text-slate-900 focus:outline-none bg-transparent flex-1 border-none focus:ring-0 placeholder-slate-300"
                            placeholder="Tên đoạn kênh..."
                          />
                          <button 
                            onClick={() => removeSection(section.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa đoạn này"
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">b_đáy (m)</label>
                            <input
                              type="number"
                              value={section.bottomWidth}
                              onChange={(e) => updateSection(section.id, 'bottomWidth', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                          <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-1.5 tracking-wider text-center">H_kênh thiết kế (m)</label>
                            <input
                              type="number"
                              value={section.canalDepth}
                              onChange={(e) => updateSection(section.id, 'canalDepth', Number(e.target.value))}
                              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            />
                          </div>
                          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                            <label className="block text-[10px] font-black text-amber-600 uppercase mb-1.5 tracking-wider text-center">h_bồi hiện trạng (m)</label>
                            <input
                              type="number"
                              value={section.siltDepth}
                              onChange={(e) => updateSection(section.id, 'siltDepth', Number(e.target.value))}
                              className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                            />
                          </div>
                          {section.type === CanalType.TRAPEZOIDAL && (
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-wider text-center">Hệ số mái m</label>
                              <input
                                type="number"
                                step="0.1"
                                value={section.sideSlope}
                                onChange={(e) => updateSection(section.id, 'sideSlope', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-black text-center focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* CHI TIẾT THÔNG SỐ TRUNG GIAN (CHO BIÊN BẢN) */}
                        <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <Info size={16} className="text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông số kỹ thuật trung gian (Ghi biên bản)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                              <div className="text-[10px] text-slate-500 uppercase font-black">Bề rộng mặt bồi (b_mặt)</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{section.bottomWidth} + 2×{section.sideSlope}×{section.siltDepth} =</span>
                                <span className="text-xl font-black text-blue-400 tracking-tight">{res.topWidth.toFixed(3)}<span className="text-sm ml-1 opacity-50 font-normal">m</span></span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] text-blue-400 uppercase font-black">Bề rộng trung bình (b_tb)</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">({section.bottomWidth} + {res.topWidth.toFixed(3)})/2 =</span>
                                <span className="text-2xl font-black text-emerald-400 tracking-tight underline decoration-emerald-400/20 underline-offset-8">{res.averageWidth.toFixed(3)}<span className="text-sm ml-1 opacity-50 font-normal">m</span></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
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

                        {/* Đánh giá tỷ lệ */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`flex items-center gap-4 p-4 rounded-[1.25rem] border ${getStatusColor(res.siltDepthRatio)} transition-colors`}>
                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                              {getStatusIcon(res.siltDepthRatio)}
                            </div>
                            <div>
                              <div className="text-[9px] uppercase font-black opacity-60 tracking-wider">Bồi / Chiều sâu</div>
                              <div className="text-lg font-black">{res.siltDepthRatio.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className={`flex items-center gap-4 p-4 rounded-[1.25rem] border ${getStatusColor(res.siltVolumeRatio)} transition-colors`}>
                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                              {getStatusIcon(res.siltVolumeRatio)}
                            </div>
                            <div>
                              <div className="text-[9px] uppercase font-black opacity-60 tracking-wider">Bồi / Thể tích</div>
                              <div className="text-lg font-black">{res.siltVolumeRatio.toFixed(1)}%</div>
                            </div>
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
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-6 -mt-6"></div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 border-b border-slate-200 pb-3 text-center">Kết quả đoạn này</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-bold">Diện tích bồi (A):</span>
                              <span className="text-sm font-black text-slate-800">{res.crossSectionArea.toFixed(3)} m²</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <span className="text-xs text-slate-500 font-bold">Thể tích (V):</span>
                              <span className="text-xl font-black text-blue-700">{res.totalVolume.toLocaleString('vi-VN')} m³</span>
                            </div>
                            <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100/50">
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
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Calculator size={24} />
              </div>
              Tổng hợp dự án
            </h2>
            
            <div className="space-y-5 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[1.5rem] border border-blue-200/50 flex items-center gap-5 group">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">m³</div>
                <div>
                  <div className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1 opacity-70">Tổng bùn nạo vét</div>
                  <div className="text-3xl font-black text-slate-900 leading-none">{totalAllVolume.toLocaleString('vi-VN')}</div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[1.5rem] border border-emerald-200/50 flex items-center gap-5 group">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">đ</div>
                <div>
                  <div className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1 opacity-70">Tổng kinh phí chi trả</div>
                  <div className="text-3xl font-black text-slate-900 leading-none">{totalAllCost.toLocaleString('vi-VN')}</div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || sections.length === 0}
                className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 text-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={24} />}
                XUẤT BÁO CÁO AI
              </button>

              {aiReport && (
                <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm text-slate-800 leading-relaxed max-h-[400px] overflow-y-auto shadow-inner custom-scrollbar">
                  <div className="flex items-center gap-2 text-blue-700 font-black mb-4 uppercase text-[10px] tracking-[0.2em] border-b border-blue-100 pb-3">
                    <Info size={14} /> Chẩn đoán kỹ thuật bởi AI
                  </div>
                  <div className="whitespace-pre-wrap font-medium">
                    {aiReport}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-5 rounded-2xl bg-slate-50 text-[10px] text-slate-400 font-medium italic leading-relaxed border-l-4 border-blue-500/30">
              * Hệ thống tự động đánh giá năng lực dẫn nước:<br/>
              - <span className="text-emerald-600 font-bold">Dưới 25%:</span> Bình thường, duy trì bảo trì.<br/>
              - <span className="text-amber-600 font-bold">25% - 50%:</span> Lưu lượng bị cản trở, cần kế hoạch nạo vét.<br/>
              - <span className="text-red-600 font-bold">Trên 50%:</span> Nghiêm trọng, kênh mất năng lực tiêu thoát.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            Tác giả: <span className="text-slate-900">Văn Chiến</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full hidden md:block"></div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            Điện thoại: <span className="text-slate-900">085.4746837</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          &copy; 2025 PHẦN MỀM KỸ THUẬT THỦY LỢI CHUYÊN DỤNG
        </p>
      </footer>
    </div>
  );
};

export default App;
