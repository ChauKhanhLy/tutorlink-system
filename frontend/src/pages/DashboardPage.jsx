import React from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import TopBar from "../components/Dashboard/TopBar";
import SessionCard from "../components/Dashboard/SessionCard";
import { sessions, tutors } from "../mockData";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("sessions");

  return (
    <div className="pt-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 flex gap-8">
        
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 space-y-6">
          <TopBar activeTab={activeTab} />

          {activeTab === "sessions" && (
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold">Buổi học sắp tới</h3>

              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  tutor={tutors.find(t => t.id === s.tutorId)}
                />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}