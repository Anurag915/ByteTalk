import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, ArrowLeft, Activity, Server, Users, MessageSquare } from "lucide-react";
import axios from "axios";
const AdminDashboard = () => {
  const { isCheckingAuth } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/system/queue");
      if (response.data.success) {
        setStats(response.data.stats);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch system statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isCheckingAuth || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0E0B14]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0b14] to-[#1a1525] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            System Dashboard
          </h1>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
            <Activity className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Connection Error</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
              title="Total Messages"
              value={stats.messages}
              subtitle="Currently in queue"
              gradient="from-blue-500/20 to-cyan-500/20"
              border="border-blue-500/30"
            />
            <StatCard
              icon={<Activity className="w-6 h-6 text-green-400" />}
              title="Messages Ready"
              value={stats.messages_ready}
              subtitle="Waiting to be processed"
              gradient="from-green-500/20 to-emerald-500/20"
              border="border-green-500/30"
            />
            <StatCard
              icon={<Server className="w-6 h-6 text-orange-400" />}
              title="Unacknowledged"
              value={stats.messages_unacknowledged}
              subtitle="Currently processing"
              gradient="from-orange-500/20 to-red-500/20"
              border="border-orange-500/30"
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-violet-400" />}
              title="Active Consumers"
              value={stats.consumers}
              subtitle="Connected background workers"
              gradient="from-violet-500/20 to-fuchsia-500/20"
              border="border-violet-500/30"
            />
          </div>
        ) : null}

        <div className="mt-12 p-6 bg-[#282142]/50 border border-white/5 rounded-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            RabbitMQ Status
          </h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${stats && stats.state === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white/70 capitalize">
              {stats ? `Queue State: ${stats.state}` : "Offline"}
            </span>
          </div>
          <p className="text-sm text-white/50 mt-4">
            Data refreshes automatically every 5 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, gradient, border }) => (
  <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} border ${border} backdrop-blur-xl flex flex-col`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-[#0a0f1b]/50 rounded-xl">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-white/70">{title}</h3>
    </div>
    <div className="text-4xl font-bold text-white mb-2">{value}</div>
    <div className="text-xs text-white/50">{subtitle}</div>
  </div>
);

export default AdminDashboard;
