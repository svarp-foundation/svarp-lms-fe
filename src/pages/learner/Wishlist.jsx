import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import LearnerLayout from "../../components/LearnerLayout";
import CourseCard from "../../components/CourseCard";
import { CourseGridSkeleton } from "../../components/Skeletons";
import { PageHeader, EmptyState } from "../../components/common";
import { Heart, BookOpen } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/wishlist`);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <LearnerLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Saved Wishlist"
          subtitle="Keep track of courses and certifications you plan to explore next"
        />

        {loading ? (
          <CourseGridSkeleton count={4} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Explore our course catalog and click the bookmark heart on any course card to save it for later."
            actionLabel="Browse Course Catalog"
            onAction={() => navigate("/courses-catalog")}
            actionIcon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default Wishlist;
