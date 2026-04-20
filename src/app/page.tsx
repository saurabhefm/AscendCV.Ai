"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus, PenTool, UploadCloud, FileText, Upload } from 'lucide-react';

export default function ResumeBuilder() {
  const [inputText, setInputText] = useState("");
  const [resumeData, setResumeData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State Management
  const [activeTab, setActiveTab] = useState<'ai' | 'upload' | 'manual'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<'modern' | 'harvard'>('modern');
  const [template, setTemplate] = useState('modern');
  
  // Manual Tab Form State
  const [manualData, setManualData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    skills: ""
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to process PDF");
      
      const result = await response.json();
      if(result.success && result.data) {
        setResumeData(result.data);
      } else {
        alert("Failed to extract data from PDF.");
      }
    } catch(error) {
      console.error(error);
      alert("AI Error parsing PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const applyManualEntry = () => {
    if (!manualData.name) return alert("Please fill the manual details.");
    
    setResumeData({
      basics: {
        name: manualData.name,
        email: manualData.email,
        phone: "+1 555-0100",
        location: "New York, NY"
      },
      summary: "Dynamic professional eager to contribute skills towards robust scalable infrastructure.",
      experience: [
        {
          company: manualData.company || "Your Company",
          role: manualData.role || "Your Role",
          startDate: "Jan 2020",
          endDate: "Present",
          isCurrent: true,
          bullets: ["Manually entered mock role data.", "Edit these within the template code base."]
        }
      ],
      skills: {
        technical: manualData.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
    });
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
    return (
      <div className="w-full h-28 bg-slate-50 border border-slate-200 mb-2 shadow-sm rounded-lg flex items-center justify-center overflow-hidden relative group transition-all">
        {tId.includes('modern') ? (
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8h18M8 8v13" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h10M7 16h6" />
          </svg>
        )}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-white text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            Preview
          </span>
        </div>
      </div>
    );
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
          
          {/* Box 1: Career Details Tabbed Component */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[440px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Career Details</h2>
              <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'ai' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <PenTool size={13} /> AI Write
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'upload' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <UploadCloud size={14} /> Upload PDF
                </button>
                <button 
                  onClick={() => setActiveTab('manual')}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'manual' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <FileText size={14} /> Manual Entry
                </button>
              </div>
            </div>

            {/* Content for AI Write */}
            {activeTab === 'ai' && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-64 p-5 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
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
            )}

            {/* Content for Upload PDF */}
            {activeTab === 'upload' && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                 <label className="flex flex-col items-center justify-center w-full h-[348px] border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all relative">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <>
                          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                          <p className="mb-2 text-sm text-slate-600 font-bold">Extracting & Parsing PDF...</p>
                          <p className="text-xs text-slate-400">Our AI is mapping your data to the STAR format.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                            <Upload className="w-8 h-8 text-blue-500" />
                          </div>
                          <p className="mb-2 text-sm text-slate-500 font-semibold"><span className="text-blue-600">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-slate-400">Supported: .PDF (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
                 </label>
              </div>
            )}

            {/* Content for Manual Entry */}
            {activeTab === 'manual' && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 space-y-5 h-[348px] flex flex-col justify-between">
                 <div>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 focus:text-blue-600">Full Name</label>
                       <input type="text" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Jane Doe" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                       <input type="email" value={manualData.email} onChange={e => setManualData({...manualData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="jane@example.com" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recent Company</label>
                       <input type="text" value={manualData.company} onChange={e => setManualData({...manualData, company: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Tech Inc" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role</label>
                       <input type="text" value={manualData.role} onChange={e => setManualData({...manualData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Software Engineer" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Key Skills (comma separated)</label>
                     <input type="text" value={manualData.skills} onChange={e => setManualData({...manualData, skills: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="React, Node.js, TypeScript" />
                   </div>
                 </div>
                 
                 <button 
                  onClick={applyManualEntry}
                  className="w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl hover:-translate-y-0.5"
                >
                  <CheckCircle2 size={18} /> Apply to Template
                </button>
              </div>
            )}
            
          </div>

          {/* Sliding Gallery */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">2. Choose Style</h2>
              
              {/* Category Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-full">
                <button 
                  onClick={() => setSelectedCategory('modern')}
                  className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all ${selectedCategory === 'modern' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Modern
                </button>
                <button 
                  onClick={() => setSelectedCategory('harvard')}
                  className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all ${selectedCategory === 'harvard' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
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
                <button className="min-w-[160px] h-[178px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50 opacity-70 cursor-not-allowed snap-center mt-px transition-all">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Plus size={24} className="text-slate-400" />
                  </div>
                  <span className="font-bold text-sm text-center px-4">More Styles<br/>Coming Soon</span>
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
