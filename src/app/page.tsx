"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResumeBuilder() {
  const [inputText, setInputText] = useState("");
  const [resumeData, setResumeData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('modern'); // 'modern' or 'classic'
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!inputText) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText }),
      });
      const data = await response.json();
      if(data.success && data.data) {
        setResumeData(data.data);
      } else {
        alert("Failed to parse resume.");
      }
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
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("My_AI_Resume.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="font-bold text-xl text-blue-600">AscendCV.Ai</h1>
        {resumeData && (
          <button 
            onClick={downloadPDF}
            className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 transition"
          >
            Download PDF
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-bold mb-4">1. Enter Experience</h2>
            <textarea 
              className="w-full h-60 p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Paste your raw career details here..."
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100"
            >
              {isGenerating ? "Processing..." : "Generate AI Resume"}
            </button>
          </div>

          <div>
            <h2 className="font-bold mb-4">2. Choose Template</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTemplate('classic')}
                className={`p-4 border-2 rounded-xl text-left ${template === 'classic' ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
              >
                <div className="w-full h-24 bg-white border mb-2 shadow-sm rounded flex flex-col p-2 gap-1">
                  <div className="h-2 w-1/2 bg-slate-200" />
                  <div className="h-1 w-full bg-slate-100" />
                  <div className="h-1 w-full bg-slate-100" />
                </div>
                <p className="font-bold text-sm">Classic HBS</p>
              </button>
              
              <button 
                onClick={() => setTemplate('modern')}
                className={`p-4 border-2 rounded-xl text-left ${template === 'modern' ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
              >
                <div className="w-full h-24 bg-white border mb-2 shadow-sm rounded flex flex-col items-center p-2 gap-1">
                  <div className="h-4 w-4 rounded-full bg-blue-100 mb-1" />
                  <div className="h-2 w-2/3 bg-slate-200" />
                  <div className="h-1 w-full bg-slate-100" />
                </div>
                <p className="font-bold text-sm">Ultra Modern</p>
              </button>
            </div>
          </div>
        </section>

        {/* --- Resume Preview Area --- */}
        <section className="bg-slate-200 p-8 rounded-3xl overflow-auto h-[800px] flex justify-center">
          <div 
            ref={resumeRef}
            className={`bg-white w-[595px] min-h-[842px] p-12 shadow-2xl transition-all ${template === 'modern' ? 'border-t-8 border-blue-600' : ''}`}
          >
            {resumeData ? (
              <div>
                <h1 className={`text-3xl font-black ${template === 'modern' ? 'text-blue-600' : 'text-slate-900'}`}>
                  {resumeData.basics.name}
                </h1>
                <p className="text-slate-500 font-medium mb-8 flex justify-between">
                  <span>{resumeData.basics.email} | {resumeData.basics.phone}</span>
                  <span>{resumeData.basics.location}</span>
                </p>
                
                {resumeData.summary && (
                  <p className="text-slate-700 text-sm mb-8 leading-relaxed">
                    {resumeData.summary}
                  </p>
                )}
                
                <h3 className="font-bold border-b-2 mb-4 uppercase tracking-widest text-xs">Experience</h3>
                {resumeData.experience.map((exp: any, i: number) => (
                  <div key={i} className="mb-6">
                    <p className="font-bold text-slate-800">{exp.company} — {exp.role}</p>
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                      {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || ""}
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mt-2">
                      {exp.bullets.map((b: string, j: number) => (
                        <li key={j} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-300 mt-40">Your AI Resume will appear here...</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
