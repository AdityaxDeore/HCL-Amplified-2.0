import { createContext, useContext, useState, useEffect } from 'react';
import { mockLearner } from '../data/mockLearner';
import { mockRoadmap } from '../data/mockRoadmap';
import { mockSkills } from '../data/mockSkills';
import { mockResources } from '../data/mockResources';
import { mockProgress } from '../data/mockProgress';

const LearnerContext = createContext();

export function LearnerProvider({ children }) {
  const [learner, setLearner] = useState(mockLearner);
  const [roadmapNodes, setRoadmapNodes] = useState(mockRoadmap.nodes);
  const [resources, setResources] = useState(mockResources);
  const [progress, setProgress] = useState(mockProgress);
  const [skills, setSkills] = useState(mockSkills);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000);
  }

  // Actions
  function markNodeComplete(nodeId) {
    setRoadmapNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'completed' } : n));
    // Update progress conceptually
    setProgress(prev => {
      const completed = roadmapNodes.filter(n => n.status === 'completed').length + 1;
      const total = roadmapNodes.length;
      return {
        ...prev,
        overall: Math.round((completed / total) * 100),
        topicsCompleted: prev.topicsCompleted + 1
      };
    });
    showToast('Roadmap node marked as complete!');
  }

  function markNodeStatus(nodeId, status) {
    setRoadmapNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status } : n));
    showToast(`Roadmap node marked as ${status.replace('_', ' ')}`);
  }

  function toggleResourceSaved(resourceId) {
    setResources(prev => {
      const newRes = prev.map(r => r.id === resourceId ? { ...r, saved: !r.saved } : r);
      const isSaved = newRes.find(r => r.id === resourceId)?.saved;
      if (isSaved) showToast('Resource saved!');
      else showToast('Resource removed from saved.');
      return newRes;
    });
  }

  function addSkillToRoadmap(skillId) {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, inRoadmap: true } : s));
    showToast('Skill added to roadmap!');
  }

  function updateLearnerProfile(updates) {
    setLearner(prev => ({ ...prev, ...updates }));
    showToast('Profile updated successfully!');
  }

  const value = {
    learner,
    roadmapNodes,
    resources,
    progress,
    skills,
    toast,
    markNodeComplete,
    markNodeStatus,
    toggleResourceSaved,
    addSkillToRoadmap,
    updateLearnerProfile,
    showToast
  };

  return (
    <LearnerContext.Provider value={value}>
      {children}
      
      {/* Global Toast UI */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          {toast.message}
        </div>
      </div>
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}
