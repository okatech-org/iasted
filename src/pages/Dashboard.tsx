import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { SpecificationsView } from '@/components/dashboard/SpecificationsView';
import { VisionView } from '@/components/dashboard/VisionView';
import { SettingsView } from '@/components/dashboard/SettingsView';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'specifications' && <SpecificationsView />}
        {activeTab === 'vision' && <VisionView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
