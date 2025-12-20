import React from 'react';
import { BedDouble, Plane, TicketPercent } from 'lucide-react';

const TABS = [
  { id: 'hotel', label: 'Khách sạn', icon: BedDouble },
  { id: 'flight', label: 'Vé máy bay', icon: Plane },
  { id: 'activity', label: 'Hoạt động', icon: TicketPercent }
];

const HeroSearchTabs = ({ activeTab, onChange }) => {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600 shadow-sm">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            type="button"
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default HeroSearchTabs;