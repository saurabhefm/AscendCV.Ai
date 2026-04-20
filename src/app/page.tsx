"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus } from 'lucide-react';

export default function ResumeBuilder() {
  const [inputText, setInputText] = useState("");
  const [resumeData, setResumeData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<'modern' | 'harvard'>('modern');
  const [template, setTemplate] = useState('modern');
  
  const resumeRef = useRef<HTMLDivElement>(null);
  const scrollGalleryRef = useRef<HTMLDivElement>(null);

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

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollGalleryRef.current) {
      scrollGalleryRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const templatesConfig = {
    modern: [
      { id: 'modern', name: 'Ultra Modern', desc: 'Sidebar layout' },
      { id: 'modern_clean', name: 'Clean Modern', desc: 'Minimalist' },
      { id: 'modern_bold', name: 'Bold Exec', desc: 'High contrast' },
    ],
    harvard: [
      { id: 'classic', name: 'Classic HBS', desc: 'Traditional' },
      { id: 'harvard_alt', name: 'Ivy League', desc: 'Wide margins' },
      { id: 'academic', name: 'Academic', desc: 'Dense content' },
    ]
  };

  const activeTemplates = templatesConfig[selectedCategory];
  const isModernTheme = template.includes('modern');

  const renderThumbnail = (tId: string) => {
    if (tId.includes('modern')) {
      const headerColor = tId === 'modern_bold' ? 'bg-slate-900' : 'bg-blue-600';
      return (
        <div className="w-full h-28 bg-white border border-slate-200 mb-2 shadow-sm rounded flex flex-col overflow-hidden pointer-events-none relative transition-all">
          <div className={`h-3 w-full ${headerColor}`} />
          <div className="flex flex-1">
            <div className="w-1/3 border-r border-slate-100 bg-slate-50 p-2 flex flex-col gap-1.5">
              <div className="h-2 w-full bg-slate-300 rounded-full" />
              <div className="h-1 w-full bg-slate-200" />
            </div>
            <div className="w-2/3 p-2 flex flex-col gap-1.5">
              <div className="h-2 w-3/4 bg-slate-300 rounded-full" />
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-5/6 bg-slate-200" />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-28 bg-white border border-slate-200 mb-2 shadow-sm rounded flex flex-col p-3 gap-1.5 overflow-hidden pointer-events-none transition-all">
          <div className="h-3 w-3/4 bg-slate-300 mx-auto" />
          <div className="h-1.5 w-1/2 bg-slate-200 mx-auto mb-2" />
          <div className="h-1 w-full bg-slate-200" />
          <div className="h-1 w-full bg-slate-200" />
          <div className="h-1 w-5/6 bg-slate-200" />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
      
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

          {/* Sliding Gallery */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">2. Choose Style</h2>
              
              {/* Category Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setSelectedCategory('modern')}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${selectedCategory === 'modern' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Modern
                </button>
                <button 
                  onClick={() => setSelectedCategory('harvard')}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${selectedCategory === 'harvard' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Harvard
                </button>
              </div>
            </div>

            <div className="relative group pt-2">
              {/* Left Scroll Nav */}
              <button 
                onClick={() => scrollGallery('left')}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border p-2 rounded-full text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Gallery Scroll Container */}
              <div 
                ref={scrollGalleryRef} 
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {activeTemplates.map(tpl => (
                  <button 
                    key={tpl.id}
                    onClick={() => setTemplate(tpl.id)}
                    className={`min-w-[160px] p-3 border-2 rounded-2xl text-left transition-all snap-center relative focus:outline-none ${template === tpl.id ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                    {template === tpl.id && (
                      <div className="absolute top-1 right-1 z-10 bg-white rounded-full p-0.5">
                        <CheckCircle2 size={22} className="fill-blue-600 text-white" />
                      </div>
                    )}
                    {renderThumbnail(tpl.id)}
                    <h3 className={`font-bold text-sm mt-1 ${template === tpl.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {tpl.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-tight">{tpl.desc}</p>
                  </button>
                ))}
                
                {/* Explore More Card */}
                <button className="min-w-[160px] h-[178px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all snap-center bg-transparent mt-px">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <span className="font-bold text-sm">Explore More</span>
                </button>
              </div>

              {/* Right Scroll Nav */}
              <button 
                onClick={() => scrollGallery('right')}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border p-2 rounded-full text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* --- Right Side: The Actual Resume --- */}
        <section className="lg:col-span-7 bg-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-inner overflow-y-auto max-h-[900px] flex justify-center relative">
          <div 
            ref={resumeRef}
            className={`bg-white w-[595px] min-h-[842px] p-12 shadow-2xl transition-all
              ${isModernTheme ? 'border-t-[12px] border-blue-600' : 'border-t border-slate-100'}`}
          >
            {resumeData ? (
              <div className="space-y-8">
                {/* Header Section */}
                <header className={isModernTheme ? 'text-left' : 'text-center border-b pb-6'}>
                  <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">
                    {resumeData.basics?.name || "Saurabh Kumar"}
                  </h1>
                  <div className={`flex gap-4 text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest ${isModernTheme ? 'justify-start' : 'justify-center'}`}>
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
