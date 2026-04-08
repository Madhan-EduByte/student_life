import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import roadmapService from '../services/roadmapService';
import useRoadmapStore from '../store/roadmapStore';

export function useRoadmap() {
  const queryClient = useQueryClient();
  const { setActiveRoadmap, setMilestones, setIsGenerating } = useRoadmapStore();

  const activeRoadmapQuery = useQuery({
    queryKey: ['roadmap', 'active'],
    queryFn: async () => {
      const response = await roadmapService.getActive();
      setActiveRoadmap(response.data);
      return response.data;
    },
    enabled: false,
  });

  const allRoadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const response = await roadmapService.getAll();
      return response.data;
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (careerInputs) => {
      setIsGenerating(true);
      const response = await roadmapService.generate(careerInputs);
      return response.data;
    },
    onSuccess: (data) => {
      setActiveRoadmap(data);
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const milestoneMutation = useMutation({
    mutationFn: ({ milestoneId, isCompleted }) =>
      roadmapService.updateMilestone(milestoneId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  return {
    activeRoadmap: activeRoadmapQuery,
    allRoadmaps: allRoadmapsQuery,
    generateRoadmap: generateMutation,
    toggleMilestone: milestoneMutation,
  };
}

export default useRoadmap;
