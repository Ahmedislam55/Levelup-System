import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function ActiveTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/admin/users?role=TEACHER&isActive=true");
        if (!isMounted) return;
        const data = res.data?.data || res.data;
        setTeachers(data?.items || data || []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message || "Failed to load active teachers"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchActive();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-main">Active Teachers</h1>
        <p className="text-sm text-gray-500">Currently active teachers</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-full text-center">Loading...</div>}
        {error && (
          <div className="col-span-full text-center text-red-600">{error}</div>
        )}
        {!loading && !error && teachers.length === 0 && (
          <div className="col-span-full text-center">No active teachers</div>
        )}
        {teachers.map((t) => (
          <div key={t.id || t._id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.email}</p>
              </div>
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


