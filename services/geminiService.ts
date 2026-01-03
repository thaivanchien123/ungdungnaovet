
import { GoogleGenAI } from "@google/genai";
import { CanalSection, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateEngineeringReport = async (
  sections: CanalSection[],
  results: CalculationResult[]
): Promise<string> => {
  const totalVolume = results.reduce((acc, curr) => acc + curr.totalVolume, 0);
  const totalCost = results.reduce((acc, curr) => acc + curr.totalCost, 0);

  const context = sections.map((s, i) => {
    const res = results[i];
    return `
    - Đoạn: ${s.name} (${s.type})
    - Kích thước thiết kế: L=${s.length}m, b=${s.bottomWidth}m, H_kênh=${s.canalDepth}m, m=${s.sideSlope}
    - Tình trạng bồi: h_bồi=${s.siltDepth}m, V_bồi=${res.totalVolume.toFixed(2)}m3
    - Tỷ lệ bồi: %h=${res.siltDepthRatio.toFixed(1)}%, %V=${res.siltVolumeRatio.toFixed(1)}%
    - Chi phí: ${res.totalCost.toLocaleString('vi-VN')} VNĐ
    `;
  }).join("\n");

  const prompt = `
    Dưới tư cách là một chuyên gia kỹ sư thủy lợi, hãy phân tích dữ liệu nạo vét và bồi lắng sau:
    ${context}
    
    Tổng khối lượng nạo vét: ${totalVolume.toLocaleString('vi-VN')} m3
    Tổng kinh phí: ${totalCost.toLocaleString('vi-VN')} VNĐ

    Yêu cầu báo cáo:
    1. Đánh giá chi tiết năng lực dẫn nước: Dựa trên tỷ lệ %h và %V, kênh có còn đảm bảo mặt cắt lưu thông thiết kế không? (Cảnh báo nếu bồi lấp > 30%).
    2. Phân tích mức độ bồi lắng: Đoạn nào nghiêm trọng nhất?
    3. Gợi ý biện pháp thi công và nạo vét tối ưu.
    4. Khuyến nghị bảo trì định kỳ.
    Trình bày chuyên nghiệp, súc tích bằng tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Không thể tạo báo cáo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Có lỗi xảy ra khi phân tích bằng AI.";
  }
};
