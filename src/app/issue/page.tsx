'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ShieldCheck, Upload, FileText, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
export default function IssuePage() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    studentName: 'Amit Sharma',
    institution: 'Hindustan College',
    certificateName: 'B.Tech in Computer Science',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const [isIssuing, setIsIssuing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1
  });

  const handleAutoGenerate = async () => {
    setIsIssuing(true);
    try {
      const doc = new jsPDF('landscape');
      
      // Custom design for Hindustan College
      doc.setFillColor(245, 249, 255);
      doc.rect(0, 0, 297, 210, 'F');
      
      // Generate a unique ID for this certificate so the hash is unique per generation
      const uniqueId = nanoid(16);
      
      // Border
      doc.setDrawColor(3, 105, 161); // sky blue dark
      doc.setLineWidth(3);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(1);
      doc.rect(12, 12, 273, 186);

      // Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(3, 105, 161);
      doc.text(formData.institution, 148.5, 50, { align: "center" });

      doc.setFontSize(24);
      doc.setTextColor(50, 50, 50);
      doc.text("Certificate of Degree", 148.5, 75, { align: "center" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("This is to certify that", 148.5, 100, { align: "center" });

      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      const studName = formData.studentName || "Student Name";
      doc.text(studName, 148.5, 120, { align: "center" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text("has successfully completed the degree program in", 148.5, 140, { align: "center" });

      doc.setFontSize(22);
      doc.setFont("helvetica", "italic");
      const certName = formData.certificateName || "Degree";
      doc.text(certName, 148.5, 160, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Issued on: ${formData.issueDate}`, 148.5, 180, { align: "center" });

      // Seal
      doc.setFillColor(3, 105, 161);
      doc.circle(240, 165, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL", 240, 163, { align: "center" });
      doc.text("SEAL", 240, 168, { align: "center" });

      // Embed Unique QR Code
      const qrDataUrl = await QRCode.toDataURL(`trustchain-cert:${uniqueId}|${studName}|${formData.institution}`, {
        margin: 1,
        width: 150,
        color: { dark: '#0369a1', light: '#f5f9ff' }
      });
      doc.addImage(qrDataUrl, 'PNG', 26, 146, 35, 35);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(6);
      doc.text(`ID: ${uniqueId}`, 43.5, 184, { align: "center" });

      const pdfBlob = doc.output('blob');
      const genFile = new File([pdfBlob], `${studName.replace(/\s+/g, '_')}_${formData.institution.replace(/\s+/g, '')}.pdf`, { type: 'application/pdf' });
      setFile(genFile);
      
      // Auto-download the simulated PDF to the user's computer
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = genFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch(e) {
      console.error(e);
      alert("Error generating PDF");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please upload a certificate document');

    setIsIssuing(true);
    let finalFile = file;
    
    // Automatically Stamp Uploaded Document with a Secure QR Code
    try {
      const { PDFDocument } = await import('pdf-lib');
      const uniqueId = nanoid(16);
      const studentNameSafe = formData.studentName || "Upload";
      const qrDataUrl = await QRCode.toDataURL(`trustchain-cert:${uniqueId}|${studentNameSafe}|${formData.institution}`, {
        margin: 1,
        width: 250,
        color: { dark: '#0369a1', light: '#f5f9ff' }
      });
      // Convert QR to buffer
      const qrRes = await fetch(qrDataUrl);
      const qrBuffer = await qrRes.arrayBuffer();

      if (file.type === 'application/pdf') {
        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const qrImage = await pdfDoc.embedPng(qrBuffer);
        
        // Draw near bottom right
        const { width, height } = firstPage.getSize();
        firstPage.drawImage(qrImage, {
          x: width - 70,
          y: 30,
          width: 50,
          height: 50,
        });

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(modifiedPdfBytes)], { type: 'application/pdf' });
        finalFile = new File([blob], file.name, { type: 'application/pdf' });
      } else if (file.type.startsWith('image/')) {
        // Modify Image via HTML Canvas
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const qrImg = new window.Image();
          qrImg.src = qrDataUrl;
          await new Promise((resolve) => { qrImg.onload = resolve; });
          
          // Draw QR scaled into the bottom right corner
          const qrSize = Math.max(80, Math.min(bitmap.width, bitmap.height) * 0.15);
          ctx.drawImage(qrImg, bitmap.width - qrSize - 20, bitmap.height - qrSize - 20, qrSize, qrSize);
          
          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, file.type));
          if (blob) {
            finalFile = new File([blob], file.name, { type: file.type });
          }
        }
      }
      
      // Since it's a completely new hashed file, automatically download the stamped copy for the user
      const downloadUrl = URL.createObjectURL(finalFile);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = `trustchain_stamped_${file.name}`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error("Error trying to stamp QR code onto file:", err);
      // Failsafe: Continue with original file if parsing fails
    }

    // Simulate File -> Hash -> API -> Smart Contract
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
      // Removed the JSON receipt auto-download as the user already downloads the physical PDF certificate.

    } catch (error: any) {
      console.error(error);
      alert(`Failed to issue credential: ${error.message}`);
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Issue Credential</h1>
        <p className="text-muted-foreground">Securely anchor a new certificate to the Polygon blockchain.</p>
      </div>

      {!result ? (
        <form onSubmit={handleIssue} className="grid md:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Document Upload
                </h2>
                <button 
                  type="button" 
                  onClick={handleAutoGenerate}
                  className="text-xs bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Generate Fake PDF
                </button>
              </div>
              
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/20",
                  file && "border-green-500 bg-green-50"
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-green-600/70 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Upload className="w-10 h-10 mb-4 text-primary/40" />
                    <p className="font-medium text-foreground">Drag & drop certificate here</p>
                    <p className="text-sm mt-1">PDF, JPG, or PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Metadata</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.studentName}
                    onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition" 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Certificate Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.certificateName}
                    onChange={e => setFormData({ ...formData, certificateName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition" 
                    placeholder="e.g. Bachelor of Science in CS"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Institution</label>
                    <input 
                      type="text" 
                      value={formData.institution}
                      onChange={e => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                    <input 
                      required 
                      type="date" 
                      value={formData.issueDate}
                      onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isIssuing || !file}
                className="w-full mt-8 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-glass-primary"
              >
                {isIssuing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Anchoring to Polygon...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Issue Credential</>
                )}
              </button>
            </div>
          </div>

        </form>
      ) : (
        <div className="bg-white p-10 rounded-2xl border shadow-sm max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Credential Issued Successfully</h2>
          <p className="text-muted-foreground mb-8">
            The certificate has been permanently anchored to the Polygon Amoy blockchain.
          </p>

          <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-4 mb-8">
            {result.certId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                <p className="font-mono text-xs text-foreground mt-1 break-all">{result.certId}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Document SHA-256 Hash</p>
              <p className="font-mono text-xs text-foreground mt-1 break-all">{result.documentHash}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Polygon Transaction Hash</p>
              <p className="font-mono text-xs text-blue-600 mt-1 break-all hover:underline cursor-pointer">
                <a href={`https://amoy.polygonscan.com/tx/${result.txHash}`} target="_blank" rel="noreferrer">
                  {result.txHash}
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => setResult(null)} className="px-6 py-2 rounded-lg btn-glass">
              Issue Another
            </button>
            <Link href={`/verify`} className="px-6 py-2 rounded-lg btn-glass-primary">
              Go to Verifier
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
