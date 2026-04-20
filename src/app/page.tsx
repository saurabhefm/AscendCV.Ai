"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResumeBuilder() {
  const [inputText, setInputText] = useState("");
  const [resumeData, setResumeData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('classic'); 
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!inputText) return alert("Please enter your details first!");
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText }),
      });

      if (!response.ok) throw new Error("Failed to connect to AI");

      const data = await response.json();
      if(data.success && data.data) {
        setResumeData(data.data);
      } else {
        alert("Failed to parse resume.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("AI Error: Make sure your API Key is set in the .env file.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if(!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("AscendCV_Resume.pdf");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">AscendCV.Ai</h1>
        </div>
        {resumeData && (
          <button 
            onClick={downloadPDF}
            className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 transition shadow-lg"
          >
            Download PDF
          </button>
        )}
      </nav>

      <main className="max-w-[1440px] mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- Left Side: Controls --- */}
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">1. Career Details</h2>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-64 p-5 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Example: I am a DevOps Engineer at Deutsche Bank. I optimized ETL pipelines and used Jenkins for CI/CD..."
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
                ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
            >
              {isGenerating ? "✨ AI is Working..." : "✨ Generate AI Resume"}
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Choose Style</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTemplate('classic')}
                className={`p-4 border-2 rounded-2xl text-left transition-all flex flex-col items-center ${template === 'classic' ? 'border-blue-600 bg-blue-50 scale-[1.02] shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                {/* Classic Miniature */}
                <div className="w-full h-32 bg-white border border-slate-200 mb-3 shadow-sm rounded flex flex-col p-3 gap-2 overflow-hidden pointer-events-none">
                  <div className="h-3 w-3/4 bg-slate-300 mx-auto" />
                  <div className="h-1.5 w-1/2 bg-slate-200 mx-auto mb-2" />
                  <div className="h-1 w-full bg-slate-200" />
                  <div className="h-1 w-full bg-slate-200" />
                  <div className="h-1 w-5/6 bg-slate-200" />
                </div>
                <div className="w-full">
                  <p className="font-bold text-slate-800">Classic HBS</p>
                  <p className="text-[10px] text-slate-500">Top-to-bottom standard</p>
                </div>
              </button>
              
              <button 
                onClick={() => setTemplate('modern')}
                className={`p-4 border-2 rounded-2xl text-left transition-all flex flex-col items-center ${template === 'modern' ? 'border-blue-600 bg-blue-50 scale-[1.02] shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                {/* Modern Miniature */}
                <div className="w-full h-32 bg-white border border-slate-200 mb-3 shadow-sm rounded flex flex-col overflow-hidden pointer-events-none relative">
                  <div className="h-3 w-full bg-blue-600" />
                  <div className="flex flex-1">
                    <div className="w-1/3 border-r border-slate-100 bg-slate-50 p-2 flex flex-col gap-1.5">
                      <div className="h-2 w-full bg-slate-300 rounded-full" />
                      <div className="h-1 w-full bg-slate-200" />
                    </div>
                    <div className="w-2/3 p-2 flex flex-col gap-1.5">
                      <div className="h-2 w-3/4 bg-slate-300 rounded-full" />
                      <div className="h-1 w-full bg-slate-200" />
                      <div className="h-1 w-5/6 bg-slate-200" />
                      <div className="h-1 w-full bg-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <p className="font-bold text-slate-800">Ultra Modern</p>
                  <p className="text-[10px] text-slate-500">Sidebar layout</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* --- Right Side: The Actual Resume --- */}
        <section className="lg:col-span-7 bg-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-inner overflow-y-auto max-h-[900px] flex justify-center">
          <div 
            ref={resumeRef}
            className={`bg-white w-[595px] min-h-[842px] p-12 shadow-2xl transition-all
              ${template === 'modern' ? 'border-t-[12px] border-blue-600' : 'border-t border-slate-100'}`}
          >
            {resumeData ? (
              <div className="space-y-8">
                {/* Header Section */}
                <header className={template === 'modern' ? 'text-left' : 'text-center border-b pb-6'}>
                  <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">
                    {resumeData.basics?.name || "Saurabh Kumar"}
                  </h1>
                  <div className="flex justify-center gap-4 text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">
                    <span>{resumeData.basics?.email}</span>
                    <span>•</span>
                    <span>{resumeData.basics?.location}</span>
                  </div>
                </header>

                {/* Summary Section */}
                <section>
                   <p className="text-sm leading-relaxed text-slate-600 italic">
                     {resumeData.summary}
                   </p>
                </section>

                {/* Experience Section */}
                <section className="space-y-6">
                  <h3 className="font-bold text-blue-600 uppercase tracking-[0.2em] text-[10px] border-b pb-1">Work Experience</h3>
                  {resumeData.experience?.map((job: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-slate-800 text-sm">{job.company}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{job.startDate} - {job.isCurrent ? 'Present' : job.endDate || ''}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">{job.role}</p>
                      <ul className="list-disc list-outside ml-4 mt-2 text-[11px] text-slate-600 space-y-1.5">
                        {job.bullets?.map((bullet: string, j: number) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>

                {/* Skills Section */}
                {resumeData.skills?.technical && (
                  <section className="space-y-3">
                     <h3 className="font-bold text-blue-600 uppercase tracking-[0.2em] text-[10px] border-b pb-1">Technical Skills</h3>
                     <div className="flex flex-wrap gap-2">
                       {resumeData.skills?.technical?.map((skill: string, i: number) => (
                         <span key={i} className="px-3 py-1 bg-slate-50 border rounded-full text-[10px] font-bold text-slate-600">
                           {skill}
                         </span>
                       ))}
                     </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                 <div className="w-16 h-16 border-4 border-dashed border-slate-200 rounded-full animate-spin" />
                 <p className="font-medium italic">Your AI Resume will appear here...</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
