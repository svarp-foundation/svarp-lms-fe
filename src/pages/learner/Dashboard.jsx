import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/learner/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingDeadlines = [1, 2];

  return (
    <LearnerLayout>
      {/* Welcome banner */}
      <div className="w-full bg-accent text-white px-8 py-6">
        <h1 className="text-2xl font-bold">
          Welcome back
          {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-gray-300 text-sm mt-1">
          Pick up where you left off or explore new courses.
        </p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* SECTION 1: In Progress */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            In Progress / Resume Learning
          </h2>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} enrolled={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">
                You don't have any courses in progress.
              </p>
              <Link to="/" className="text-primary font-bold mt-2 inline-block">
                Browse Courses
              </Link>
            </div>
          )}
        </section>

        {/* SECTION 2: Upcoming Deadlines */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Upcoming Deadlines / Assignments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingDeadlines.map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-48 flex flex-col items-center justify-center text-gray-400"
              >
                <Calendar size={40} className="mb-2 text-gray-300" />
                <span className="text-sm">No upcoming deadlines</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LearnerLayout>
  );
};

export default Dashboard;
