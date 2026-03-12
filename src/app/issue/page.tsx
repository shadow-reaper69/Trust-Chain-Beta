'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, Loader2, CheckCircle2, Wand2, Lock, ExternalLink, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { GridScan } from '@/components/GridScan';

export default function IssuePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    studentName: 'Amit Sharma',
    institution: 'Hindustan College',
    certificateName: 'B.Tech in Computer Science',
    issueDate: new Date().toISOString().split('T')[0]
  });
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const [isIssuing, setIsIssuing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ipfsStatus, setIpfsStatus] = useState<'unknown' | 'checking' | 'available' | 'not-found'>('unknown');

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    let userRole = supaSession?.user.user_metadata?.role;

    if (!userRole) {
      const demoRaw = localStorage.getItem('trustchain_session');
      if (demoRaw) {
        try {
          const demo = JSON.parse(demoRaw);
          if (demo.expiresAt > Date.now()) {
            userRole = demo.role;
          }
        } catch (e) {}
      }
    }

    const finalRole = userRole || 'student';
    setRole(finalRole);
    setLoading(false);
    
    if (finalRole === 'student') {
      router.push('/admin');
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    let finalFile: File | null = null;
    
    try {
      // Professional B&W PDF
      const doc = new jsPDF('landscape');
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, 'F');
      
      const uniqueId = nanoid(16);
      
      // Brutalist Border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(1);
      doc.rect(13, 13, 271, 184);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(48);
      doc.setTextColor(0, 0, 0);
      doc.text(formData.institution.toUpperCase(), 148.5, 50, { align: "center" });

      doc.setFontSize(22);
      doc.text("OFFICIAL ACADEMIC CREDENTIAL", 148.5, 75, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "italic");
      doc.text("This record serves as an immutable proof of achievement for", 148.5, 100, { align: "center" });

      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      const studName = formData.studentName || "Student Name";
      doc.text(studName.toUpperCase(), 148.5, 125, { align: "center" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("WHO HAS SUCCESSFULLY COMPLETED THE REQUIREMENTS FOR", 148.5, 145, { align: "center" });

      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      const certName = formData.certificateName || "Degree";
      doc.text(certName.toUpperCase(), 148.5, 165, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`ISSUED ON: ${formData.issueDate}`, 148.5, 185, { align: "center" });

      // Brutalist Seal
      doc.setFillColor(0, 0, 0);
      doc.rect(230, 150, 40, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("VERIFIED", 250, 165, { align: "center" });
      doc.text("BY VLD", 250, 175, { align: "center" });

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trustchain-v2.vercel.app';
      const qrDataUrl = await QRCode.toDataURL(`${origin}/verify?documentHash=${uniqueId}`, {
        margin: 1,
        width: 150,
        color: { dark: '#000000', light: '#ffffff' }
      });
      doc.addImage(qrDataUrl, 'PNG', 26, 150, 35, 35);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(6);
      doc.text(`TRIPLE-LEDGER ID: ${uniqueId}`, 148.5, 203, { align: "center" });

      const pdfBlob = doc.output('blob');
      finalFile = new File([pdfBlob], `${studName.replace(/\s+/g, '_')}_Certificate.pdf`, { type: 'application/pdf' });
      
      const url = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(url);
    } catch(e) {
      alert("Error generating PDF");
      setIsIssuing(false);
      return;
    }
      
    const data = new FormData();
    data.append('file', finalFile);
    data.append('studentName', formData.studentName);
    data.append('institution', formData.institution);
    data.append('certificateName', formData.certificateName);
    data.append('issueDate', formData.issueDate);

    try {
      const res = await fetch('/api/issue', {
        method: 'POST',
        body: data
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'API error');
      
      setResult(json);
      if (json?.ipfsCid) {
        setIpfsStatus('checking');
        try {
          const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
          const fetchRes = await fetch(`${gateway}/ipfs/${json.ipfsCid}`);
          if (fetchRes.ok) setIpfsStatus('available');
          else setIpfsStatus('not-found');
        } catch (e) {
          setIpfsStatus('not-found');
        }
      }
    } catch (error: any) {
      alert(`Failed to issue credential: ${error.message}`);
    } finally {
      setIsIssuing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">AUTHORIZING ISSUER ENTITY...</div>;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <GridScan 
          linesColor="#000000" 
          scanColor="#000000" 
          gridScale={0.15} 
          lineThickness={1} 
          bloomIntensity={0}
          enablePost={false}
          scanOpacity={0.1}
          lineJitter={0.05}
        />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl relative z-10 animate-in fade-in duration-700">
        <div className="mb-20 text-center">
          <h1 className="text-6xl font-black bg-black text-white px-8 py-4 inline-block transform -skew-x-6 mb-6">ISSUANCE HUB</h1>
          <p className="text-lg text-slate-500 font-black uppercase tracking-[0.3em]">Seal documents with Triple-Ledger Protocol</p>
        </div>

        {!result ? (
          <form onSubmit={handleIssue} className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white border-8 border-black p-12 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute -top-6 -right-6 bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest z-20 transform rotate-2">
                NOTARY_READY
              </div>
              
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <FileText className="w-8 h-8" /> RECIPIENT DATA ENTRY
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Full Legal Name</label>
                  <input required type="text" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} className="w-full border-b-8 border-slate-100 focus:border-black py-4 outline-none font-black text-2xl bg-transparent transition-colors uppercase" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">AWARDING INSTITUTION</label>
                  <input required type="text" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="w-full border-b-8 border-slate-100 focus:border-black py-4 outline-none font-black text-2xl bg-transparent transition-colors uppercase" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">CREDENTIAL TITLE</label>
                  <input required type="text" value={formData.certificateName} onChange={e => setFormData({ ...formData, certificateName: e.target.value })} className="w-full border-b-8 border-slate-100 focus:border-black py-4 outline-none font-black text-2xl bg-transparent transition-colors uppercase" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">CONFERRAL DATE</label>
                  <input required type="date" value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} className="w-full border-b-8 border-slate-100 focus:border-black py-4 outline-none font-black text-2xl bg-transparent transition-colors" />
                </div>
              </div>

              <button type="submit" disabled={isIssuing} className="w-full mt-16 py-8 bg-black text-white font-black text-2xl uppercase tracking-tighter shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                {isIssuing ? (
                  <><Loader2 className="w-8 h-8 animate-spin" /> ANCHORING TO POLYGON...</>
                ) : (
                  <><Wand2 className="w-8 h-8 group-hover:rotate-12 transition-transform" /> GENERATE & SEAL PROOF</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-16 border-8 border-black shadow-[40px_40px_0px_0px_rgba(0,0,0,1)] max-w-3xl mx-auto text-center relative overflow-hidden">
            <div className="w-24 h-24 bg-black text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 transform rotate-6 shadow-2xl">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-6xl font-black mb-6 tracking-tighter">PROOF SEALED</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] mb-12">
              NOTARIZED VIA TRIPLE-LEDGER PROTOCOL
            </p>

            <div className="grid grid-cols-1 gap-6 mb-12 text-left font-black uppercase tracking-widest">
              <div className="bg-slate-50 p-8 border-l-8 border-black group hover:bg-black hover:text-white transition-colors">
                 <span className="text-[10px] opacity-40 tracking-widest group-hover:text-white/50">POLYGON TRANSACTION</span>
                 <p className="font-mono text-xs mt-2 break-all">{result.txHash}</p>
              </div>
              <div className="bg-slate-50 p-8 border-l-8 border-black group hover:bg-black hover:text-white transition-colors">
                 <span className="text-[10px] opacity-40 tracking-widest group-hover:text-white/50">IPFS CONTENT IDENTIFIER (CID)</span>
                 <p className="font-mono text-xs mt-2 break-all">{result.ipfsCid || 'PENDING SYNC'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {generatedPdfUrl && (
                 <>
                   <button 
                     onClick={() => window.open(generatedPdfUrl, '_blank')}
                     className="py-6 border-4 border-black text-black font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition"
                   >
                     PREVIEW PROOF
                   </button>
                   <a 
                     href={generatedPdfUrl} 
                     download={`${formData.studentName.replace(/\s+/g, '_')}_Certificate.pdf`} 
                     className="py-6 bg-black text-white font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-slate-900 transition"
                   >
                     <Download className="w-6 h-6" /> DOWNLOAD_PDF
                   </a>
                 </>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button onClick={() => setResult(null)} className="py-5 bg-slate-100 font-black uppercase text-xs tracking-widest border-2 border-black hover:bg-slate-200 transition">RE-ISSUE</button>
              <Link href={`/verify`} className="py-5 bg-slate-100 font-black uppercase text-xs tracking-widest border-2 border-black hover:bg-slate-200 transition text-center flex items-center justify-center gap-2">VALIDATOR <ExternalLink className="w-4 h-4" /></Link>
            </div>

            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <ShieldCheck className="w-80 h-80" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
