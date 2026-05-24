import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import careerGuideService from '../services/career-guideService';
import useCareerGuideStore from '../store/career-guideStore';

export function useCareerGuide() {
  const queryClient = useQueryClient();
  const { setActiveCareerGuide, setMilestones, setIsGenerating } = useCareerGuideStore();

  const activeCareerGuideQuery = useQuery({
    queryKey: ['careerGuide', 'active'],
    queryFn: async () => {
      const response = await careerGuideService.getActive();
      setActiveCareerGuide(response.data);
      return response.data;
    },
    enabled: false,
  });

  const allCareerGuidesQuery = useQuery({
    queryKey: ['careerGuides'],
    queryFn: async () => {
      const response = await careerGuideService.getAll();
      return response.data;
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (careerInputs) => {
      setIsGenerating(true);
      const response = await careerGuideService.generate(careerInputs);
      return response.data;
    },
    onSuccess: (data) => {
      setActiveCareerGuide(data);
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['careerGuides'] });
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const milestoneMutation = useMutation({
    mutationFn: ({ milestoneId, isCompleted }) =>
      careerGuideService.updateMilestone(milestoneId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGuide'] });
    },
  });

  return {
    activeCareerGuide: activeCareerGuideQuery,
    allCareerGuides: allCareerGuidesQuery,
    generateCareerGuide: generateMutation,
    toggleMilestone: milestoneMutation,
  };
}

export default useCareerGuide;
