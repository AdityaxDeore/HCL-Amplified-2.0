import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockLearner } from '../data/mockLearner';
import { mockRoadmap } from '../data/mockRoadmap';
import { mockSkills } from '../data/mockSkills';
import { mockResources } from '../data/mockResources';
import { mockProgress } from '../data/mockProgress';

import { learnerApi } from '../api/learnerApi';
import { roadmapApi } from '../api/roadmapApi';
import { skillsApi } from '../api/skillsApi';
import { resourcesApi } from '../api/resourcesApi';
import { progressApi } from '../api/progressApi';
import { gapApi } from '../api/gapApi';
import { readinessApi } from '../api/readinessApi';
import { interviewApi } from '../api/interviewApi';
import { recommendationApi } from '../api/recommendationApi';

const LearnerContext = createContext();

export function LearnerProvider({ children }) {
  const [learner, setLearner] = useState(mockLearner);
  const [roadmap, setRoadmap] = useState(mockRoadmap);
  const [roadmapNodes, setRoadmapNodes] = useState(mockRoadmap.nodes);
  const [resources, setResources] = useState(mockResources);
  const [progress, setProgress] = useState(mockProgress);
  const [skills, setSkills] = useState(mockSkills);
  const [gaps, setGaps] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [latestInterview, setLatestInterview] = useState(null);
  const [nextAction, setNextAction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch initial data from backend API
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        learnerRes, roadmapRes, skillsRes, resourcesRes, progressRes,
        gapRes, readRes, intRes, recRes
      ] = await Promise.allSettled([
        learnerApi.getLearner(),
        roadmapApi.getRoadmap(),
        skillsApi.getSkills(),
        resourcesApi.getResources(),
        progressApi.getProgress(),
        gapApi.getGaps(),
        readinessApi.getReadiness('demo-learner'),
        interviewApi.getHistory('demo-learner'),
        recommendationApi.getNextBestActions(undefined, undefined, 1)
      ]);

      if (learnerRes.status === 'fulfilled' && learnerRes.value) {
        setLearner(learnerRes.value);
      }
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
        setRoadmap(roadmapRes.value);
        if (roadmapRes.value.nodes) {
          setRoadmapNodes(roadmapRes.value.nodes);
        }
      }
      if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value) && skillsRes.value.length > 0) {
        setSkills(skillsRes.value);
      }
      if (resourcesRes.status === 'fulfilled' && Array.isArray(resourcesRes.value) && resourcesRes.value.length > 0) {
        setResources(resourcesRes.value);
      }
      if (progressRes.status === 'fulfilled' && progressRes.value) {
        setProgress(progressRes.value);
      }
      if (gapRes.status === 'fulfilled' && gapRes.value) {
        setGaps(gapRes.value);
      }
      if (readRes.status === 'fulfilled' && readRes.value) {
        setReadiness(readRes.value);
      }
      if (intRes.status === 'fulfilled' && Array.isArray(intRes.value) && intRes.value.length > 0) {
        setLatestInterview(intRes.value[0]);
      }
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) {
        setNextAction(recRes.value[0]);
      }
    } catch (err) {
      console.warn('Backend connection notice: using initialized state.', err);
      setError(err.message || 'Unable to load all data from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  async function markNodeComplete(nodeId) {
    const roadmapId = roadmap.id || 'ai-engineer';
    // Optimistic UI update
    setRoadmapNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'completed' } : n));
    try {
      const res = await roadmapApi.updateNode(roadmapId, nodeId, { status: 'completed' });
      if (res && res.nodes) {
        setRoadmap(res);
        setRoadmapNodes(res.nodes);
      }
      // Refresh progress & readiness to maintain consistency across views
      const [updatedProg, updatedRead] = await Promise.allSettled([
        progressApi.getProgress(),
        readinessApi.getReadiness(learner.id || 'demo-learner')
      ]);
      if (updatedProg.status === 'fulfilled' && updatedProg.value) setProgress(updatedProg.value);
      if (updatedRead.status === 'fulfilled' && updatedRead.value) setReadiness(updatedRead.value);
      showToast('Roadmap node marked as complete!');
    } catch (err) {
      console.error('Failed to update node on backend:', err);
      showToast('Node marked complete locally.', 'info');
    }
  }

  async function markNodeStatus(nodeId, status) {
    const roadmapId = roadmap.id || 'ai-engineer';
    setRoadmapNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status } : n));
    try {
      const res = await roadmapApi.updateNode(roadmapId, nodeId, { status });
      if (res && res.nodes) {
        setRoadmap(res);
        setRoadmapNodes(res.nodes);
      }
      showToast(`Roadmap node marked as ${status.replace('_', ' ')}`);
    } catch (err) {
      console.error('Failed to update node status on backend:', err);
      showToast(`Roadmap node marked as ${status.replace('_', ' ')}`, 'info');
    }
  }

  async function removeNode(nodeId) {
    const roadmapId = roadmap.id || 'ai-engineer';
    setRoadmapNodes(prev => prev.filter(n => n.id !== nodeId));
    try {
      const res = await roadmapApi.deleteNode(roadmapId, nodeId);
      if (res && res.nodes) {
        setRoadmap(res);
        setRoadmapNodes(res.nodes);
      }
      showToast('Topic removed from roadmap', 'success');
    } catch (err) {
      console.error('Failed to delete node on backend:', err);
      showToast('Topic removed from view', 'info');
    }
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

  async function updateLearnerProfile(updates) {
    // Optimistic UI update
    setLearner(prev => ({ ...prev, ...updates }));
    try {
      const updated = await learnerApi.updateProfile(updates);
      if (updated) {
        setLearner(updated);
      }
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to save profile to backend:', err);
      showToast('Profile updated locally.', 'info');
    }
  }

  const value = {
    learner,
    roadmap,
    roadmapNodes,
    resources,
    progress,
    skills,
    gaps,
    readiness,
    latestInterview,
    nextAction,
    loading,
    error,
    toast,
    refreshData,
    markNodeComplete,
    markNodeStatus,
    removeNode,
    toggleResourceSaved,
    addSkillToRoadmap,
    updateLearnerProfile,
    showToast,
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
