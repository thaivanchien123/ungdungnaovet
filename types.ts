
export enum CanalType {
  TRAPEZOIDAL = 'TRAPEZOIDAL',
  RECTANGULAR = 'RECTANGULAR'
}

export interface CanalSection {
  id: string;
  name: string;
  type: CanalType;
  length: number;      // L (m)
  bottomWidth: number; // b (m)
  canalDepth: number;  // H_kênh (m) - Chiều sâu thiết kế
  siltDepth: number;   // h_bồi (m)
  sideSlope: number;   // m
  unitPrice: number;   // VNĐ/m3
}

export interface CalculationResult {
  topWidth: number;          // b_mặt bồi (m)
  averageWidth: number;      // b_tb bồi (m)
  crossSectionArea: number;  // A_bồi (m2)
  totalVolume: number;       // V_bồi (m3)
  canalVolume: number;       // V_thiết_kế (m3)
  siltDepthRatio: number;    // % h bồi / H kênh
  siltVolumeRatio: number;   // % V bồi / V kênh
  totalCost: number;         // VNĐ
}
