import React from "react";
import { Link } from "react-router-dom";
import { SearchBar, FilterTabs, StatusBadge, Button, EmptyState, CourseThumbnail } from "../common";
import {
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  Eye,
  Users,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const CourseList = ({
  courses = [],
  searchTerm = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenImporter,
}) => {
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && (c.status === "published" || c.is_published)) ||
      (statusFilter === "draft" && (c.status === "draft" || (!c.status && !c.is_published)));

    return matchesSearch && matchesStatus;
  });

  const filterOptions = [
    { id: "all", label: "All Courses", count: courses.length },
    {
      id: "published",
      label: "Published",
      count: courses.filter((c) => c.status === "published" || c.is_published).length,
    },
    {
      id: "draft",
      label: "Drafts",
      count: courses.filter((c) => c.status === "draft" || (!c.status && !c.is_published)).length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
          <SearchBar
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter courses by title or topic..."
            className="flex-1"
          />
          <FilterTabs
            tabs={filterOptions}
            activeTab={statusFilter}
            onChange={onStatusFilterChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {onOpenImporter && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenImporter}
              icon={Sparkles}
            >
              Text Importer
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onCreateCourse}
            icon={Plus}
          >
            Create Course
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            searchTerm
              ? `No courses matching "${searchTerm}". Try adjusting your filters.`
              : "You haven't created any courses yet. Start authoring your first course!"
          }
          actionLabel="Create First Course"
          onAction={onCreateCourse}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const isPublished = course.status === "published" || course.is_published;
            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <CourseThumbnail
                      thumbnailUrl={course.thumbnail_url}
                      title={course.title}
                    />
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <StatusBadge
                        status={isPublished ? "published" : "draft"}
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description || "No description provided."}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        <span>{course.enrolled_count ?? course.students_count ?? 0} learners</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers size={13} className="text-slate-400" />
                        <span>{course.modules_count ?? course.modules?.length ?? 0} modules</span>
                      </div>
                      <div className="ml-auto font-bold text-slate-900">
                        {course.is_paid && course.price > 0 ? `₹${course.price}` : "Free"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/courses/${course.id}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="Preview in Course Catalog"
                  >
                    <ExternalLink size={14} />
                  </Link>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onEditCourse(course)}
                      icon={Pencil}
                    >
                      Manage
                    </Button>
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseList;
