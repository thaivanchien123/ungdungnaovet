
import React from 'react';
import { CanalType } from '../types';

interface VisualizerProps {
  type: CanalType;
  b: number;      // b đáy
  h_silt: number; // h bồi
  H_canal: number; // H thiết kế
  m: number;      // hệ số mái
}

const Visualizer: React.FC<VisualizerProps> = ({ type, b, h_silt, H_canal, m }) => {
  // Tính toán tỷ lệ hiển thị
  // Giới hạn các giá trị tối thiểu để tránh lỗi chia cho 0 hoặc hình quá nhỏ
  const safeB = Math.max(b, 0.1);
  const safeH = Math.max(H_canal, 0.1);
  const safeM = Math.max(m, 0);
  
  // Tính bề rộng mặt trên cùng để xác định khung hình
  const topWidthDesign = safeB + 2 * safeM * safeH;
  
  // Tỷ lệ quy đổi: 200px cho kích thước lớn nhất
  const maxDim = Math.max(topWidthDesign, safeH);
  const scale = 220 / (maxDim || 1); 
  
  const displayB = safeB * scale;
  const displayH_canal = safeH * scale;
  const displayH_silt = h_silt * scale;
  const displayM_canal = safeM * displayH_canal;
  const displayM_silt = safeM * displayH_silt;
  
  // Kích thước SVG
  const padding = 80; // Tăng padding để đủ chỗ ghi chú số liệu
  const width = displayB + 2 * displayM_canal + padding * 2;
  const height = displayH_canal + padding;
  
  const centerX = width / 2;
  const bottomY = height - 40;
  const topY = bottomY - displayH_canal;
  const siltTopY = bottomY - displayH_silt;

  // Tọa độ mặt cắt kênh thiết kế
  let canalPoints = "";
  let siltPoints = "";

  if (type === CanalType.TRAPEZOIDAL) {
    const x1 = centerX - (displayB / 2) - displayM_canal;
    const x2 = centerX - (displayB / 2);
    const x3 = centerX + (displayB / 2);
    const x4 = centerX + (displayB / 2) + displayM_canal;
    canalPoints = `${x1},${topY} ${x2},${bottomY} ${x3},${bottomY} ${x4},${topY}`;

    const sx1 = centerX - (displayB / 2) - displayM_silt;
    const sx4 = centerX + (displayB / 2) + displayM_silt;
    siltPoints = `${sx1},${siltTopY} ${x2},${bottomY} ${x3},${bottomY} ${sx4},${siltTopY}`;
  } else {
    const x1 = centerX - (displayB / 2);
    const x2 = centerX + (displayB / 2);
    canalPoints = `${x1},${topY} ${x1},${bottomY} ${x2},${bottomY} ${x2},${topY}`;
    siltPoints = `${x1},${siltTopY} ${x1},${bottomY} ${x2},${bottomY} ${x2},${siltTopY}`;
  }

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-inner overflow-hidden w-full">
      <h3 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Mô phỏng mặt cắt lưu thông</h3>
      
      <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="drop-shadow-sm">
        {/* Lớp nước (Mặt cắt thiết kế) */}
        <polyline
          points={canalPoints}
          fill="#e0f2fe"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Lớp bùn bồi lắng (Chồng lên trên) */}
        <polyline
          points={siltPoints}
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Đường biên trên cùng của bùn (nếu có bồi) */}
        {h_silt > 0 && (
          <line 
            x1={centerX - (displayB / 2) - (type === CanalType.TRAPEZOIDAL ? displayM_silt : 0)} 
            y1={siltTopY} 
            x2={centerX + (displayB / 2) + (type === CanalType.TRAPEZOIDAL ? displayM_silt : 0)} 
            y2={siltTopY} 
            stroke="#475569" 
            strokeWidth="1" 
            strokeDasharray="2 2"
          />
        )}

        {/* CÁC NHÃN KÍCH THƯỚC */}
        <g className="text-[11px] font-black fill-slate-700">
          {/* b đáy */}
          <text x={centerX} y={bottomY + 20} textAnchor="middle">b = {b}m</text>
          
          {/* H kênh thiết kế (Bên phải) */}
          <g>
            <line 
              x1={centerX + (displayB/2) + displayM_canal + 15} y1={topY} 
              x2={centerX + (displayB/2) + displayM_canal + 15} y2={bottomY} 
              stroke="#0ea5e9" strokeWidth="1.5" 
            />
            <line x1={centerX + (displayB/2) + displayM_canal + 10} y1={topY} x2={centerX + (displayB/2) + displayM_canal + 20} y2={topY} stroke="#0ea5e9" strokeWidth="1.5" />
            <line x1={centerX + (displayB/2) + displayM_canal + 10} y1={bottomY} x2={centerX + (displayB/2) + displayM_canal + 20} y2={bottomY} stroke="#0ea5e9" strokeWidth="1.5" />
            <text x={centerX + (displayB/2) + displayM_canal + 25} y={(topY + bottomY)/2} textAnchor="start" dominantBaseline="middle" className="fill-blue-600">
              H_tk = {H_canal}m
            </text>
          </g>

          {/* h bồi lắng (Bên trái) */}
          {h_silt > 0 && (
            <g>
              <line 
                x1={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 15} y1={siltTopY} 
                x2={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 15} y2={bottomY} 
                stroke="#64748b" strokeWidth="1.5" 
              />
              <line x1={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 20} y1={siltTopY} x2={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 10} y2={siltTopY} stroke="#64748b" strokeWidth="1.5" />
              <line x1={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 20} y1={bottomY} x2={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 10} y2={bottomY} stroke="#64748b" strokeWidth="1.5" />
              <text x={centerX - (displayB/2) - (type === CanalType.TRAPEZOIDAL ? displayM_canal : 0) - 25} y={(siltTopY + bottomY)/2} textAnchor="end" dominantBaseline="middle" className="fill-slate-600">
                h_bồi = {h_silt}m
              </text>
            </g>
          )}
        </g>
      </svg>
      
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-tight">
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-sky-100 border border-sky-400 rounded-sm"></div> Phần Nước (Lưu không)</span>
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-400 border border-slate-600 rounded-sm"></div> Bùn bồi lắng</span>
      </div>
    </div>
  );
};

export default Visualizer;
