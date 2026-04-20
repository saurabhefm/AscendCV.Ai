import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Basics {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface ResumeData {
  basics: Basics;
  experience: ExperienceEntry[];
}

interface ResumeStore {
  resumeData: ResumeData;
  updateBasics: (data: Partial<Basics>) => void;
  addExperience: (entry: ExperienceEntry) => void;
  updateExperience: (id: string, data: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  setFullData: (data: ResumeData) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumeData: {
        basics: { name: '', email: '', phone: '', location: '' },
        experience: [],
      },
      updateBasics: (data) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            basics: { ...state.resumeData.basics, ...data },
          },
        })),
      addExperience: (entry) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: [...state.resumeData.experience, entry],
          },
        })),
      updateExperience: (id, data) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.map((exp) =>
              exp.id === id ? { ...exp, ...data } : exp
            ),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.filter((exp) => exp.id !== id),
          },
        })),
      setFullData: (data) => 
        set({ resumeData: data }),
    }),
    {
      name: 'resume-storage', // key in localStorage
    }
  )
);
