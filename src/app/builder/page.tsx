"use client";

import { useEffect, useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import ResumePreview from '@/components/ResumePreview';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function BuilderPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { resumeData, updateBasics, addExperience, updateExperience, removeExperience } = useResumeStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-t-blue-500 border-slate-200 animate-spin"></div>
          Loading builder...
        </div>
      </div>
    );
  }

  const { basics, experience } = resumeData;

  const handleAddExperience = () => {
    addExperience({
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bullets: [''],
    });
  };

  const handleUpdateBullet = (expId: string, bulletIndex: number, newValue: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const newBullets = [...exp.bullets];
    newBullets[bulletIndex] = newValue;
    updateExperience(expId, { bullets: newBullets });
  };

  const handleAddBullet = (expId: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    updateExperience(expId, { bullets: [...exp.bullets, ''] });
  };
  
  const handleRemoveBullet = (expId: string, bulletIndex: number) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const newBullets = exp.bullets.filter((_, idx) => idx !== bulletIndex);
    updateExperience(expId, { bullets: newBullets });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Editor Column */}
      <div className="bg-white px-8 py-10 overflow-y-auto border-r border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Resume Builder</h1>
        
        {/* Basics Form */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 pb-2 border-b">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
              <input 
                type="text" 
                value={basics.name}
                onChange={(e) => updateBasics({ name: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input 
                type="email" 
                value={basics.email}
                onChange={(e) => updateBasics({ email: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
              <input 
                type="text" 
                value={basics.phone}
                onChange={(e) => updateBasics({ phone: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Location</label>
              <input 
                type="text" 
                value={basics.location}
                onChange={(e) => updateBasics({ location: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="New York, NY"
              />
            </div>
          </div>
        </section>

        {/* Experience Form */}
        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h2 className="text-xl font-semibold text-slate-700">Work Experience</h2>
          </div>
          
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div key={exp.id} className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative">
                <button 
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove role"
                >
                  <Trash2 size={18} />
                </button>
                
                <h3 className="font-medium text-slate-700 mb-4">Role {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company</label>
                    <input 
                      type="text" 
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Tech Corp Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Job Title</label>
                    <input 
                      type="text" 
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                    <input 
                      type="text" 
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Jan 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        disabled={exp.isCurrent}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        placeholder="Present"
                      />
                      <label className="flex items-center gap-1 text-sm text-slate-600 whitespace-nowrap cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Current
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bullets */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Responsibilities / Achievements</label>
                  <div className="space-y-2">
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex flex-row items-center gap-2">
                        <input 
                          type="text" 
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Implemented new feature reducing load time by 40%..."
                        />
                        <button 
                          onClick={() => handleRemoveBullet(exp.id, bIdx)}
                          className="text-slate-400 hover:text-red-500 p-2 shrink-0 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleAddBullet(exp.id)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors w-fit"
                  >
                    <PlusCircle size={16} /> Add Bullet
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAddExperience}
            className="mt-6 w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Add Next Role
          </button>
        </section>
      </div>
      
      {/* Preview Column */}
      <div className="bg-slate-100 p-8 overflow-y-auto flex justify-center items-start lg:sticky lg:top-0 h-screen">
        <div className="scale-[0.6] sm:scale-75 md:scale-[0.8] xl:scale-90 origin-top">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
