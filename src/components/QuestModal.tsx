import React, { useState } from 'react';
import { Quest } from '../types';
import { X, CheckCircle2, Circle, Award, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface QuestModalProps {
  quests: Quest[];
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ quests = [], onClose }) => {
  const safeQuests = Array.isArray(quests) ? quests : [];
  const [selectedQuestId, setSelectedQuestId] = useState<string>(
    safeQuests.find((q) => q.status === 'active')?.id || safeQuests[0]?.id || ''
  );

  const selectedQuest = safeQuests.find((q) => q.id === selectedQuestId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs font-pixel select-none animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border-3 border-slate-700 rounded-lg shadow-2xl p-4 sm:p-6 flex flex-col gap-4 pixel-box max-h-[85vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-sm sm:text-base font-bold text-amber-400">QUEST JOURNAL</h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-600 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1">
          {/* QUEST LIST (LEFT) */}
          <div className="sm:col-span-5 flex flex-col gap-2 overflow-y-auto max-h-[320px]">
            {safeQuests.map((q) => {
              const isSel = q.id === selectedQuestId;
              const isCompleted = q.status === 'completed';
              const isActive = q.status === 'active';

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    sound.playButtonClick();
                    setSelectedQuestId(q.id);
                  }}
                  className={`p-2.5 rounded text-left border transition-all active:scale-98 ${
                    isSel
                      ? 'bg-amber-950/70 border-amber-500 shadow'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        q.type === 'main' ? 'text-amber-400' : 'text-sky-400'
                      }`}
                    >
                      {q.type} QUEST
                    </span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : isActive
                          ? 'bg-blue-950 text-blue-300 border border-blue-700'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-1 truncate">{q.title}</div>
                </button>
              );
            })}
          </div>

          {/* QUEST DETAILS (RIGHT) */}
          <div className="sm:col-span-7 bg-slate-900/90 border border-slate-800 p-4 rounded flex flex-col justify-between">
            {selectedQuest ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-amber-300">{selectedQuest.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed italic">
                    "{selectedQuest.description}"
                  </p>
                </div>

                {/* OBJECTIVES */}
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    OBJECTIVES
                  </h4>
                  <div className="space-y-2">
                    {selectedQuest.objectives?.map((obj) => (
                      <div key={obj.id} className="flex items-start gap-2 text-xs">
                        {obj.completed ? (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle size={14} className="text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`flex-1 ${
                            obj.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                          }`}
                        >
                          {obj.text}
                        </span>
                        {obj.required > 1 && (
                          <span className="text-[10px] font-bold text-amber-300">
                            {obj.current} / {obj.required}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* REWARDS */}
                <div className="bg-amber-950/30 border border-amber-900/40 p-2.5 rounded flex flex-col gap-1.5">
                  <h4 className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                    <Award size={12} className="text-amber-400" />
                    REWARDS
                  </h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-emerald-300 font-bold">+{selectedQuest.reward.exp} EXP</span>
                    <span className="text-amber-300 font-bold">+{selectedQuest.reward.gold} Gold</span>
                    {selectedQuest.reward.items?.map((it, idx) => (
                      <span key={idx} className="text-sky-300">
                        {it.item.name} x{it.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">Select a quest to view</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
