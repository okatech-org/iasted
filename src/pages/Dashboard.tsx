import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { SpecificationsView } from '@/components/dashboard/SpecificationsView';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full p-6">
            <ChatPanel />
          </div>
        )}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'specifications' && <SpecificationsView />}
      </main>
    </div>
  );
}
