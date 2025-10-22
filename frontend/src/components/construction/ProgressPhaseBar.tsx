'use client';

import { ConstructionPhase, PhaseStatus } from '@/services/construction.service';

interface PhaseData {
  phase: ConstructionPhase;
  progress: number;
  status: PhaseStatus;
  label: string;
  color: string;
}

interface ProgressPhaseBarProps {
  phases: Array<{
    phase: ConstructionPhase;
    phaseProgress: number;
    status: PhaseStatus;
  }>;
  onPhaseClick?: (phase: ConstructionPhase) => void;
}

const PHASE_LABELS: Record<ConstructionPhase, string> = {
  FOUNDATION: 'Foundation',
  STRUCTURE: 'Structure',
  MEP: 'MEP',
  FINISHING: 'Finishing',
  HANDOVER: 'Handover',
};

const PHASE_COLORS: Record<PhaseStatus, string> = {
  NOT_STARTED: 'bg-gray-200',
  IN_PROGRESS: 'bg-blue-500',
  ON_HOLD: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
};

const PHASE_TEXT_COLORS: Record<PhaseStatus, string> = {
  NOT_STARTED: 'text-gray-600',
  IN_PROGRESS: 'text-blue-600',
  ON_HOLD: 'text-yellow-600',
  COMPLETED: 'text-green-600',
};

export default function ProgressPhaseBar({ phases, onPhaseClick }: ProgressPhaseBarProps) {
  // Ensure all 5 phases are present
  const allPhases: ConstructionPhase[] = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];
  
  const phaseData: PhaseData[] = allPhases.map(phase => {
    const phaseInfo = phases.find(p => p.phase === phase);
    return {
      phase,
      progress: phaseInfo?.phaseProgress || 0,
      status: phaseInfo?.status || 'NOT_STARTED',
      label: PHASE_LABELS[phase],
      color: PHASE_COLORS[phaseInfo?.status || 'NOT_STARTED'],
    };
  });

  const overallProgress = phaseData.reduce((sum, p) => sum + p.progress, 0) / 5;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
        <span className="text-sm font-semibold text-gray-900">{overallProgress.toFixed(1)}%</span>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
          <div
            style={{ width: `${overallProgress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          />
        </div>
      </div>

      {/* Individual Phases */}
      <div className="space-y-3 mt-6">
        {phaseData.map((phaseInfo, index) => (
          <div
            key={phaseInfo.phase}
            className={`${onPhaseClick ? 'cursor-pointer hover:bg-gray-50' : ''} p-3 rounded-lg border border-gray-200 transition-all`}
            onClick={() => onPhaseClick?.(phaseInfo.phase)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${phaseInfo.color} text-white font-semibold text-sm`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{phaseInfo.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PHASE_TEXT_COLORS[phaseInfo.status]} bg-opacity-10`}>
                      {phaseInfo.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{phaseInfo.progress}%</span>
            </div>
            
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                <div
                  style={{ width: `${phaseInfo.progress}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${phaseInfo.color} transition-all duration-300`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
