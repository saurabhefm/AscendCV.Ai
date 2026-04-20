import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';

export default function ResumePreview() {
  const { resumeData } = useResumeStore();
  const { basics, experience } = resumeData;

  return (
    <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] mx-auto p-12 text-slate-700 font-sans border border-slate-200">
      {/* Basics Section */}
      <header className="mb-8 border-b-2 border-slate-200 pb-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{basics.name || 'Your Name'}</h1>
        <div className="flex justify-center gap-4 text-sm text-slate-600">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
        </div>
      </header>

      {/* Experience Section */}
      <section>
        <h2 className="text-xl font-bold uppercase text-blue-600 mb-4 tracking-wider">Work Experience</h2>
        <div className="flex flex-col gap-6">
          {experience.map((exp) => (
            <div key={exp.id} className="flex flex-col">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-bold text-slate-900">{exp.role || 'Role Title'}</h3>
                <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || ''}
                </span>
              </div>
              <div className="text-md font-medium text-blue-600 mb-2">{exp.company || 'Company Name'}</div>
              <ul className="list-disc list-outside ml-5 text-sm text-slate-700 leading-relaxed flex flex-col gap-1">
                {exp.bullets.map((bullet, idx) => (
                  bullet.trim() !== '' && <li key={idx} className="pl-1">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
          {experience.length === 0 && (
            <p className="text-slate-400 italic">Experience entries will appear here...</p>
          )}
        </div>
      </section>
    </div>
  );
}
