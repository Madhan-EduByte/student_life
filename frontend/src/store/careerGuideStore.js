import { create } from 'zustand';

const useCareerGuideStore = create((set) => ({
  activeCareerGuide: null,
  milestones: [],
  careerInputs: {
    interest_areas: '',
    strengths: '',
    preferred_stream: '',
    education_level: '',
    budget_range: '',
    location_preference: '',
  },
  isGenerating: false,

  setActiveCareerGuide: (careerGuide) => set({ activeCareerGuide: careerGuide }),

  setMilestones: (milestones) => set({ milestones }),

  setCareerInputs: (inputs) =>
    set((state) => ({
      careerInputs: { ...state.careerInputs, ...inputs },
    })),

  resetCareerInputs: () =>
    set({
      careerInputs: {
        interest_areas: '',
        strengths: '',
        preferred_stream: '',
        education_level: '',
        budget_range: '',
        location_preference: '',
      },
    }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  toggleMilestone: (milestoneId) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId ? { ...m, is_completed: !m.is_completed } : m
      ),
    })),
}));

export default useCareerGuideStore;
