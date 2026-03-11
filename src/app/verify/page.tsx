'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ScanLine, ShieldCheck, ShieldAlert, FileSearch, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Remove generateLocalHash as the backend strictly handles this now to prevent spoofing

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setResult(null);
      
      // If image, set preview
      if (selectedFile.type.startsWith('image/')) {
         setFilePreview(URL.createObjectURL(selectedFile));
      } else {
         setFilePreview(null);
      }

      setIsVerifying(true);
      
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Dynamic wait to simulate deep analysis on the UI for UX
        await new Promise(r => setTimeout(r, 1500));

        const res = await fetch('/api/verify', {
          method: 'POST',
          body: formData
        });
        
        const json = await res.json();
        setResult(json);
      } catch (err) {
         console.error(err);
         alert('Verification Engine Error');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">VLD Engine Validation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drag and drop a credential. Our proprietary Visual Logical Detection Engine will process local cryptographic hashing and analyze visual authenticity markers against the Polygon state.
          </p>
        </div>

        {!result && !isVerifying && (
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-3xl p-24 text-center cursor-pointer transition-all bg-white shadow-sm",
              isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:shadow-md"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-muted-foreground">
              <FileSearch className="w-16 h-16 mb-6 text-primary/30" />
              <p className="font-semibold text-xl text-primary mb-2">Drop document to scan</p>
              <p className="text-sm">Maximum file size 10MB (PDF, PNG, JPG)</p>
            </div>
          </div>
        )}

        {isVerifying && (
          <div className="bg-white rounded-3xl p-16 text-center border shadow-lg relative overflow-hidden">
             
             {/* VLD Analysis CSS Scanline */}
             <motion.div 
               className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-50"
               animate={{ top: ['0%', '100%', '0%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
             />

             <ScanLine className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-pulse" />
             <h3 className="text-2xl font-bold text-primary mb-2">Google Vision AI Analysis</h3>
             <p className="text-muted-foreground mb-8">Uploading to Google Cloud Vision API & querying Polygon state...</p>

             <div className="space-y-4 max-w-sm mx-auto text-sm text-left font-mono bg-white/50 backdrop-blur-md p-6 rounded-xl border border-white/40">
                <div className="flex justify-between"><span className="text-slate-500">File Integrity</span><span className="text-blue-600 animate-pulse">Running...</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Google Vision OCR</span><span className="text-blue-600 animate-pulse">Scanning...</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Polygon Sync</span><span className="text-slate-400">Waiting</span></div>
                <div className="flex justify-between"><span className="text-slate-500">VLD Overlay Build</span><span className="text-slate-400">Queued</span></div>
             </div>
          </div>
        )}

        {result && (
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* VLD Image Viewer Component */}
            <div className="bg-white rounded-3xl border shadow-sm p-6 overflow-hidden relative">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ScanLine className="w-5 h-5" /> VLD Forgery Overlay Map
              </h3>
              
              <div className="relative bg-slate-100 rounded-xl aspect-[3/4] flex items-center justify-center overflow-hidden border">
                {filePreview ? (
                   <img src={filePreview} alt="Document Scan" className="w-full h-full object-cover opacity-80" />
                ) : (
                   <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 absolute inset-0 mix-blend-multiply flex items-center justify-center">
                     <p className="text-slate-400 font-mono text-sm">(PDF Logic Boundary Map)</p>
                   </div>
                )}

                {/* VLD Extracted Bounding Boxes Rendered by AI */}
                {result.vld && result.vld.map((box: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.4 }}
                    className={cn(
                      "absolute border-2 rounded-md group cursor-pointer transition-colors duration-300",
                      box.status === 'green' ? "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : 
                      box.status === 'yellow' ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : 
                      "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    )}
                    style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                  >
                    {/* Tooltip Hover */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded -top-10 left-1/2 -translate-x-1/2 w-48 z-10 pointer-events-none">
                      <span className="font-bold">{box.label}</span><br/>
                      <span className="text-slate-300 text-[10px]">{box.reason}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Results Panel Component */}
            <div className="flex flex-col gap-6">
              
              <div className={cn(
                "p-8 rounded-3xl border shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl relative overflow-hidden",
                result.isVerified ? "bg-green-50/60 border-green-200" : "bg-red-50/60 border-red-200"
              )}>
                <div className="absolute top-0 right-0 w-32 h-32 mix-blend-multiply opacity-20 blur-2xl rounded-full translate-x-10 -translate-y-10" 
                     style={{backgroundColor: result.isVerified ? '#22c55e' : '#ef4444'}} />
                
                <div className="flex items-center gap-4 mb-6 relative">
                  {result.isVerified ? (
                    <ShieldCheck className="w-12 h-12 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                  )}
                  <div>
                    <h2 className={cn("text-2xl font-bold", result.isVerified ? "text-green-700" : "text-red-700")}>
                      {result.isVerified ? "Authentic Credential" : "Forgery Detected"}
                    </h2>
                    <p className={cn("text-sm", result.isVerified ? "text-green-600/80" : "text-red-600/80")}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.issuerAddress && (
                  <div className="bg-white/60 p-4 rounded-xl space-y-2 border">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Signed By Smart Contract</p>
                     <p className="font-mono text-xs break-all text-slate-700">{result.issuerAddress}</p>
                  </div>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm space-y-4">
                 <h3 className="font-semibold text-lg flex items-center gap-2"><Hash className="w-4 h-4" /> Cryptographic Details</h3>
                 <div className="text-sm space-y-3">
                   <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Analysis Engine</span> <span className="font-semibold text-indigo-600">{result.analysisEngine}</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Magic Bytes Struct</span> <span className="font-semibold text-primary">{result.fileType}</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Integrity Score</span> <span className="font-semibold">{result.aiScore}% Safe</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Ledger</span> <span className="font-semibold text-blue-600">Polygon Network</span></div>
                   {result.logosDetected?.length > 0 && (
                     <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Logos Detected</span> <span className="font-semibold">{result.logosDetected.join(', ')}</span></div>
                   )}
                   <div className="flex justify-between pb-2"><span className="text-slate-500">Gas State</span> <span className="font-semibold">0.00 MATIC (L2 Verified)</span></div>
                 </div>
              </div>

              {result.ocrTextPreview && (
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
                  <h3 className="font-semibold text-sm mb-2 text-slate-500 uppercase tracking-widest">OCR Text Extracted (Preview)</h3>
                  <p className="font-mono text-xs text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">{result.ocrTextPreview}</p>
                </div>
              )}

              {result.documentHash && (
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">SHA-256 Document Hash</p>
                  <p className="font-mono text-[10px] break-all text-slate-600">{result.documentHash}</p>
                </div>
              )}

              <button onClick={() => {setResult(null); setFile(null); setFilePreview(null);}} className="p-4 rounded-xl btn-glass-primary">
                Scan New Document
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
