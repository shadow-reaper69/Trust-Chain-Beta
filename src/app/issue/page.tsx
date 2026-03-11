'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ShieldCheck, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function IssuePage() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    institution: 'Demo University',
    certificateName: '',
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

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please upload a certificate document');

    setIsIssuing(true);
    
    // Simulate File -> Hash -> API -> Smart Contract
    const data = new FormData();
    data.append('file', file);
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
      setResult(json);
    } catch (error) {
      console.error(error);
      alert('Failed to issue credential on Polygon network.');
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
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Document Upload
              </h2>
              
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
                      disabled
                      type="text" 
                      value={formData.institution}
                      className="w-full px-4 py-2 rounded-lg border bg-secondary/50 text-muted-foreground" 
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
