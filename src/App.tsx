/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Share2, 
  Copy, 
  Settings, 
  Zap, 
  Image as ImageIcon, 
  Palette, 
  Type,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Sparkles,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [value, setValue] = useState('https://neo.network/access');
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [includeLogo, setIncludeLogo] = useState(false);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [borderWidth, setBorderWidth] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr_neo_${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      const canvas = document.createElement('canvas');
      const baseSize = 1024;
      const totalSize = baseSize + (borderWidth * 20); // Scale border for high res
      canvas.width = totalSize;
      canvas.height = totalSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const img = new Image();
      img.onload = () => {
        // Background
        ctx.fillStyle = bgColor === '#ffffff00' ? '#ffffff' : bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        if (borderWidth > 0) {
          ctx.strokeStyle = fgColor;
          ctx.lineWidth = borderWidth * 8;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
        }

        // QR Code
        const qrContentSize = baseSize;
        const offset = (totalSize - qrContentSize) / 2;
        ctx.drawImage(img, offset, offset, qrContentSize, qrContentSize);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qr_neo_${Date.now()}.png`;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const explainContent = async () => {
    if (!value) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain what this content means or where it might lead, and suggest a creative use case for a neon-styled QR code pointing to it: "${value}". Provide a concise, cyberpunk-themed response in Korean.`,
      });
      setExplanation(response.text || "데이터 분석 실패. 매트릭스 연결을 확인하십시오.");
    } catch (err) {
      console.error(err);
      setExplanation("오류 발생: 신경망 연결에 실패했습니다.");
    } finally {
      setIsExplaining(false);
    }
  };

  useEffect(() => {
    if (value) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [value, level, includeLogo]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Graphic Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] neon-blur rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-[#333] pb-10 relative z-10 gap-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-massive"
          >
            QR_NEO<span className="text-[#22FF22]">.</span>
          </motion.h1>
          <div className="flex flex-col gap-1 mt-6">
            <p className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold">
              Next Generation Matrix Encoding Utility
            </p>
            <p className="text-[10px] tracking-[0.1em] opacity-40 font-bold">
              차세대 매트릭스 인코딩 유틸리티
            </p>
          </div>
        </div>
        <div className="text-left md:text-right font-mono">
          <div className="text-[40px] font-black leading-none mb-2 tabular-nums tracking-tighter">2.4.0</div>
          <div className="text-[10px] tracking-widest uppercase opacity-40 font-bold">Build: AIS_STABLE_RELEASE / 안정 버전</div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow relative z-10">
        
        {/* Input Column */}
        <div className="lg:col-span-7 flex flex-col justify-between py-2 order-2 lg:order-1">
          <div className="space-y-12">
            <section>
              <label className="label-bold text-[#22FF22] mb-6 block">
                TARGET ENDPOINT / 대상 엔드포인트
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white text-[24px] md:text-[48px] font-black tracking-tighter uppercase focus:outline-none focus:border-[#22FF22] pb-2 transition-colors placeholder:opacity-20"
                placeholder="INPUT_DATA..."
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="label-bold opacity-40 mb-6 block">ERROR CORRECTION / 오류 복구</label>
                <div className="flex flex-wrap gap-3">
                  {(['L', 'M', 'Q', 'H'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`w-14 h-14 font-black text-lg transition-all border ${
                        level === l 
                          ? 'bg-white text-black border-white' 
                          : 'border-[#333] text-white opacity-40 hover:opacity-100'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-bold opacity-40 mb-6 block">VISUAL MODIFIERS / 시각 효과</label>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setIncludeLogo(!includeLogo)}
                    className="flex flex-col items-start gap-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logo Overlay / 로고 오버레이</span>
                    <div className={`w-12 h-6 border ${includeLogo ? 'bg-[#22FF22] border-[#22FF22]' : 'border-[#333]'} relative transition-colors`}>
                      <motion.div 
                        animate={{ x: includeLogo ? 24 : 0 }}
                        className="w-5 h-5 bg-white absolute top-0.5 left-0.5"
                      />
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setBgColor(bgColor === '#ffffff' ? '#ffffff00' : '#ffffff');
                    }}
                    className="flex flex-col items-start gap-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Transparency / 투명도</span>
                    <div className={`w-12 h-6 border ${bgColor === '#ffffff00' ? 'bg-[#22FF22] border-[#22FF22]' : 'border-[#333]'}`}>
                      <div className={`w-5 h-5 bg-white m-0.5 transition-transform ${bgColor === '#ffffff00' ? 'translate-x-6' : ''}`} />
                    </div>
                  </button>
                  <div className="flex flex-col items-start gap-2 flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Border Thickness / 테두리 두께</span>
                    <div className="flex items-center gap-4 w-full">
                      <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        value={borderWidth} 
                        onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                        className="flex-grow accent-[#22FF22] h-1 bg-[#333] rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono opacity-60 w-8">{borderWidth}PX</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label-bold opacity-40 mb-6 block">MATRIX COLOR / 큐알 색상</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative w-14 h-14 border border-[#333] group overflow-hidden">
                    <input 
                      type="color" 
                      value={fgColor} 
                      onChange={(e) => setFgColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                      <div className="w-6 h-6 border-2 border-white/20" style={{ backgroundColor: fgColor }} />
                      <span className="text-[8px] font-black mt-1 opacity-40">CUSTOM</span>
                    </div>
                  </div>
                  {[
                    { name: 'NEON', hex: '#22FF22' },
                    { name: 'DARK', hex: '#000000' },
                    { name: 'CYAN', hex: '#00FFFF' },
                    { name: 'MAGENTA', hex: '#FF00FF' },
                    { name: 'CHROME', hex: '#FFFFFF' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setFgColor(color.hex)}
                      className={`w-14 h-14 flex flex-col items-center justify-center border transition-all ${
                        fgColor === color.hex ? 'bg-white text-black border-white' : 'border-[#333] text-white opacity-40 hover:opacity-100'
                      }`}
                    >
                      <div className="w-4 h-4 mb-1" style={{ backgroundColor: color.hex }} />
                      <span className="text-[8px] font-black">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 space-y-4">
            <button 
              onClick={() => downloadQR('png')}
              className="w-full btn-massive py-8 text-[20px] md:text-[28px] flex flex-col items-center justify-center -gap-1"
            >
              <div className="flex items-center gap-4">
                <Download className="w-8 h-8" />
                <span>GENERATE IDENTITY BLOCK</span>
              </div>
              <span className="text-[12px] opacity-70 tracking-[0.2em] mt-1">QR 코드 생성 및 저장</span>
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => downloadQR('svg')}
                className="flex-1 border-2 border-white py-4 flex flex-col items-center transition-all hover:bg-white hover:text-black"
              >
                <span className="text-[11px] font-black uppercase tracking-widest">VECTOR EXPORT</span>
                <span className="text-[9px] font-bold opacity-60">SVG 내보내기</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(value);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex-1 border-2 border-white py-4 flex flex-col items-center transition-all hover:bg-white hover:text-black"
              >
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {isCopied ? 'COPIED' : 'COPY ENDPOINT'}
                </span>
                <span className="text-[9px] font-bold opacity-60">URL 복사</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full aspect-square bg-[#FFFFFF] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
          >
            {/* AI Explanation Button - Positioned where the circle was */}
            <button
              onClick={explainContent}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black text-[#22FF22] text-[10px] font-black uppercase tracking-widest border border-[#22FF22] hover:bg-[#22FF22] hover:text-black transition-all shadow-[0_0_10px_rgba(34,255,34,0.3)]"
            >
              <Sparkles className="w-3 h-3" />
              이 기능을 설명해줘
            </button>

            <AnimatePresence>
              {explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-30 bg-black/95 p-8 flex flex-col justify-center backdrop-blur-sm"
                >
                  <button 
                    onClick={() => setExplanation(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-[#22FF22] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="space-y-4">
                    <label className="label-bold text-[#22FF22]">AI ANALYSIS_REPORT</label>
                    <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isLoading || isExplaining ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center text-black font-black uppercase tracking-[0.2em]"
                >
                  <RefreshCw className="w-12 h-12 animate-spin mb-4" />
                  {isExplaining ? 'Analyzing...' : 'Synthesizing...'}
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col"
                >
                  <div 
                    className="flex-grow flex items-center justify-center overflow-hidden transition-all duration-300"
                    style={{ 
                      padding: `${borderWidth}px`,
                      border: borderWidth > 0 ? `${borderWidth}px solid ${fgColor}` : 'none'
                    }}
                  >
                    <QRCodeSVG
                      ref={qrRef}
                      value={value || "EMPTY"}
                      size={512}
                      bgColor={bgColor === '#ffffff00' ? '#ffffff00' : '#ffffff'}
                      fgColor={fgColor}
                      level={level}
                      includeMargin={false}
                      className="w-full h-full"
                      imageSettings={includeLogo ? {
                        src: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/zap.svg',
                        height: 60,
                        width: 60,
                        excavate: true,
                      } : undefined}
                    />
                  </div>
                  <div className="mt-8 text-black text-center font-mono text-[10px] md:text-sm font-black tracking-[0.3em] uppercase border-t border-black/10 pt-6">
                    ID: {Math.random().toString(36).substr(2, 4).toUpperCase()}-NEO-BLOCK-{level}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer/Meta */}
      <footer className="mt-12 md:mt-20 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.3em] uppercase opacity-40 font-bold relative z-10">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Vector Export Enabled</span>
          <span>Cloud Sync: Active</span>
          <span>Encryption: AES-256</span>
        </div>
        <div>
          &copy; 2026 NEO_SYSTEMS_CORP
        </div>
      </footer>
    </div>
  );
}
