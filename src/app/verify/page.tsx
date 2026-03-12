'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ScanLine, ShieldCheck, ShieldAlert, FileSearch, Hash, Wand2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GeminiScan } from '@/components/GeminiScan';
import { GridScan } from '@/components/GridScan';

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyMode, setVerifyMode] = useState<'upload' | 'cid'>('upload');
  const [cidInput, setCidInput] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setResult(null);
      
      if (selectedFile.type.startsWith('image/')) {
         setFilePreview(URL.createObjectURL(selectedFile));
      } else {
         setFilePreview(null);
      }

      setIsVerifying(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await new Promise(r => setTimeout(r, 2500)); 

        const res = await fetch('/api/verify', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        setResult(json);
      } catch (err) {
         alert('Verification Engine Error');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleCidVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidInput.trim()) return;
    setIsVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('cid', cidInput.trim());
      await new Promise(r => setTimeout(r, 2500));

      const res = await fetch('/api/verify', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.filePreviewBase64) {
        setFilePreview(`data:${json.mimeType};base64,${json.filePreviewBase64}`);
      }
      setResult(json);
    } catch (err) {
      alert('Verification Engine Error');
    } finally {
      setIsVerifying(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <GridScan 
          linesColor="#000000" 
          scanColor="#000000" 
          gridScale={0.15} 
          lineThickness={1} 
          bloomIntensity={0}
          enablePost={false}
          scanOpacity={0.05}
          scanDuration={3}
        />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
        <div className="text-center space-y-4 mb-20">
          <h1 className="text-6xl font-black bg-black text-white px-10 py-5 inline-block transform -skew-x-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">VERIFICATION CORE</h1>
          <p className="text-xl text-slate-400 font-black uppercase tracking-[0.3em]">Triple-Ledger Validation System</p>
        </div>

        {!result && !isVerifying && (
          <div className="flex justify-center gap-6 mb-16">
            <button onClick={() => setVerifyMode('upload')} className={cn("px-10 py-4 font-black transition-all border-4 uppercase tracking-widest", verifyMode === 'upload' ? "bg-black text-white border-black" : "bg-white text-black border-slate-100 hover:border-black")}>LOCAL_UPLOAD</button>
            <button onClick={() => setVerifyMode('cid')} className={cn("px-10 py-4 font-black transition-all border-4 uppercase tracking-widest", verifyMode === 'cid' ? "bg-black text-white border-black" : "bg-white text-black border-slate-100 hover:border-black")}>IPFS_CID_QUERY</button>
          </div>
        )}

        {!result && !isVerifying && verifyMode === 'upload' && (
          <div {...getRootProps()} className={cn("border-8 border-black border-dashed rounded-[4rem] p-32 text-center cursor-pointer transition-all bg-white/80 backdrop-blur-sm relative group overflow-hidden shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)]", isDragActive ? "bg-slate-50" : "hover:border-solid hover:shadow-2xl hover:scale-[1.01]")}>
            <input {...getInputProps()} />
            <div className="relative z-10 flex flex-col items-center">
              <ScanLine className="w-24 h-24 mb-8 text-black opacity-10 group-hover:opacity-100 transition-opacity" />
              <p className="font-black text-4xl mb-4 tracking-tighter uppercase whitespace-nowrap">ENGAGE VLD SCANNER</p>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">DROP CREDENTIALS TO INITIALIZE ANALYSIS</p>
            </div>
          </div>
        )}

        {!result && !isVerifying && verifyMode === 'cid' && (
          <form onSubmit={handleCidVerify} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[4rem] p-20 text-center border-8 border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-5 animate-pulse" />
              <Hash className="w-20 h-20 mb-8 mx-auto text-black opacity-10" />
              <h3 className="text-4xl font-black mb-10 tracking-tighter uppercase">DECENTRALIZED CID QUERY</h3>
              <div className="space-y-8">
                <input 
                  type="text" 
                  value={cidInput} 
                  onChange={(e) => setCidInput(e.target.value)} 
                  placeholder="Qm... (IPFS HASH)" 
                  className="w-full px-10 py-6 border-4 border-slate-100 focus:border-black outline-none transition font-mono text-xl uppercase font-black" 
                />
                <button type="submit" className="w-full py-6 bg-black text-white font-black text-2xl hover:translate-x-2 hover:-translate-y-2 transition shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0 active:translate-y-0 uppercase tracking-widest">RUN GLOBAL SCAN</button>
              </div>
            </div>
          </form>
        )}

        {isVerifying && (
          <div className="max-w-4xl mx-auto space-y-16 py-20">
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="relative w-56 h-56">
                <motion.div 
                  className="absolute inset-0 border-8 border-black rounded-full" 
                  animate={{ rotate: 360, scale: [1, 1.02, 1] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-24 h-24 text-black animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap">DOCUMENT DNA ANALYSIS</h3>
                 <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Comparing Pinata Gateway + Supabase State + Polygon Blockchain</p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
               <GeminiScan />
               <div className="space-y-2">
                 {[
                   { label: "Supabase Integrity", status: "SYNCING" },
                   { label: "IPFS Checksum", status: "FETCHING" },
                   { label: "Polygon Anchor", status: "VALIDATING" }
                 ].map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.2 }}
                     className="flex justify-between items-center px-8 py-4 border-l-8 border-black bg-slate-50 shadow-sm"
                   >
                     <span className="text-xs font-black uppercase tracking-widest">{step.label}</span>
                     <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded max-w-[80px] truncate">{step.status}</span>
                   </motion.div>
                 ))}
               </div>
            </div>
          </div>
        )}

      {result && (
        <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in duration-700">
          {/* VLD Image Viewer */}
          <div className="bg-white rounded-[2rem] border-4 border-black p-8 relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl flex items-center gap-2 uppercase">VLD OVERLAY MAP</h3>
              <div className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded border-2 border-black">GEN-V 2.0</div>
            </div>
            
            <div className="relative bg-slate-50 rounded-2xl aspect-[3/4] flex items-center justify-center overflow-hidden border-4 border-slate-100">
              {filePreview ? (
                 <img src={filePreview} alt="Scan" className="w-full h-full object-contain opacity-60 grayscale contrast-125 transition-opacity duration-1000" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                   <FileSearch className="w-12 h-12 text-slate-200" />
                   <p className="text-slate-300 font-mono text-xs uppercase tracking-widest">(PDF LOGIC BOUNDS)</p>
                 </div>
              )}

              {/* Advanced Scanning Line Effect */}
              <motion.div 
                className="absolute inset-x-0 h-1.5 bg-black z-10 shadow-[0_0_20px_rgba(0,0,0,1)]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {result.vld && result.vld.map((box: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "absolute border-2 transition-all duration-300 hover:z-20 group cursor-help",
                    box.status === 'green' ? "border-black bg-black/5" : "border-red-600 bg-red-600/10"
                  )}
                  style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] p-2 rounded-lg -top-12 left-1/2 -translate-x-1/2 w-40 z-30 pointer-events-none border border-white/20 shadow-xl font-bold uppercase">
                    {box.label}: {box.reason}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
              <h4 className="text-6xl font-black transform -rotate-12">SECURE</h4>
            </div>
          </div>

          {/* Results Side */}
          <div className="space-y-8">
            <div className={cn("p-10 rounded-[2.5rem] border-4 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all", result.isVerified ? "bg-white border-black" : "bg-red-50 border-red-600 shadow-red-600/20")}>
               <div className="flex items-start gap-6 mb-8">
                 {result.isTripleVerified ? (
                    <div className="bg-green-500 text-white p-5 rounded-3xl shadow-[0_0_30px_rgba(34,197,94,0.4)] border-4 border-black animate-bounce"><ShieldCheck className="w-12 h-12" /></div>
                 ) : result.isVerified ? (
                    <div className="bg-green-400 text-white p-5 rounded-3xl border-4 border-black"><ShieldCheck className="w-12 h-12" /></div>
                 ) : (
                    <div className="bg-red-600 text-white p-5 rounded-3xl shadow-xl border-4 border-black"><ShieldAlert className="w-12 h-12" /></div>
                 )}
                 <div>
                   <h2 className={cn("text-6xl font-black tracking-tighter leading-none mb-3 uppercase", result.isVerified ? "text-green-600" : "text-red-600")}>
                     {result.isTripleVerified ? "100% LEGIT" : result.isVerified ? "VERIFIED" : "FRAUD DETECTED"}
                   </h2>
                   <p className="text-sm font-black opacity-80 uppercase tracking-widest leading-none">{result.message}</p>
                 </div>
               </div>

               {result.isTripleVerified && (
                 <div className="mb-8 p-6 bg-black text-white rounded-3xl flex items-center gap-4 border-2 border-white/20 shadow-inner">
                    <CheckCircle2 className="text-white w-6 h-6 flex-shrink-0" />
                    <p className="text-xs font-black uppercase tracking-tight leading-relaxed">Triple-Ledger Sync Confirmed: Cross-Verification of IPFS, Supabase Ledger, and Polygon Blockchain Successful.</p>
                 </div>
               )}

               <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 group transition-colors hover:border-black">
                    <p className="text-[10px] font-black opacity-40 mb-2 uppercase tracking-widest">Document Fingerprint (SHA-256)</p>
                    <p className="font-mono text-[10px] break-all leading-relaxed font-bold uppercase">{result.documentHash}</p>
                  </div>
                  {result.issuerAddress && (
                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 group transition-colors hover:border-black">
                      <p className="text-[10px] font-black opacity-40 mb-2 uppercase tracking-widest">Authorized Issuer Key</p>
                      <p className="font-mono text-[10px] break-all leading-relaxed font-bold uppercase">{result.issuerAddress}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* AI Meta Data Card */}
            {(result.holderName || result.institutionName) && (
              <div className="bg-white border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                 <h3 className="font-black text-xl mb-6 uppercase tracking-tight">Extracted Metadata</h3>
                 <div className="space-y-4 text-sm font-black uppercase tracking-tighter">
                    {result.holderName && (
                      <div className="flex justify-between border-b-2 border-slate-50 pb-2">
                        <span className="opacity-40">Recipient</span>
                        <span>{result.holderName}</span>
                      </div>
                    )}
                    {result.institutionName && (
                      <div className="flex justify-between border-b-2 border-slate-50 pb-2">
                        <span className="opacity-40">Institution</span>
                        <span>{result.institutionName}</span>
                      </div>
                    )}
                 </div>
              </div>
            )}

            <div className="bg-slate-50 border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
               <h3 className="font-black text-xl mb-6 uppercase tracking-tight">VLD Forensic Report</h3>
               <div className="flex gap-4">
                  <div className="flex-1 bg-green-50 border-4 border-black p-6 rounded-3xl relative overflow-hidden">
                    <div className="text-[10px] font-black opacity-50 uppercase mb-2">Security Score</div>
                    <div className="text-4xl font-black text-green-600">{result.aiScore?.toFixed(1)}%</div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-200/20 rounded-full blur-xl" />
                  </div>
                  <div className="flex-1 bg-white border-4 border-black p-6 rounded-3xl">
                    <div className="text-[10px] font-black opacity-50 uppercase mb-2">Protocol</div>
                    <div className="text-xl font-black uppercase truncate">{result.analysisEngine}</div>
                  </div>
                </div>
               
               {result.aiAssessment && (
                 <div className="p-5 bg-white border-2 border-black rounded-2xl relative z-10">
                    <p className="text-[10px] font-bold leading-relaxed text-black italic">" {result.aiAssessment} "</p>
                 </div>
               )}
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Wand2 className="w-20 h-20" />
               </div>
            </div>

            <button onClick={() => {setResult(null); setFile(null); setFilePreview(null);}} className="w-full py-8 rounded-[2.5rem] bg-black text-white font-black text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl uppercase tracking-tighter">
              SCAN ANOTHER DOCUMENT
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
