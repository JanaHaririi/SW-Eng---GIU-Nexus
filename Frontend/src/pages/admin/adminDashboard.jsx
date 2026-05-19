import { useEffect, useState } from "react";

import Spinner from "../../components/Spinner";

import { getAdminStats } from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-5">
          <h2 className="text-xl font-bold mb-4">
            Users By Role
          </h2>

          {stats?.usersByRole?.map((item, index) => (
            <p key={index} className="mb-2">
              {item._id}: {item.count}
            </p>
          ))}
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-xl font-bold mb-4">
            Jobs By Status
          </h2>

          {stats?.jobsByStatus?.map((item, index) => (
            <p key={index} className="mb-2">
              {item._id}: {item.count}
            </p>
          ))}
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-xl font-bold mb-4">
            Applications By Status
          </h2>

          {stats?.appsByStatus?.map((item, index) => (
            <p key={index} className="mb-2">
              {item._id}: {item.count}
            </p>
          ))}
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-xl font-bold mb-4">
            Top Jobs
          </h2>

          {stats?.topJobs?.map((job, index) => (
            <div
              key={index}
              className="mb-3 border-b pb-2"
            >
              <p className="font-semibold">
                {job.title}
              </p>

              <p>
                Applicants: {job.applicationCount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;