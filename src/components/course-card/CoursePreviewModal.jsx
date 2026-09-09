import React from "react";
import { Modal } from "../common";
import { VideoPlayer } from "../player";

export const CoursePreviewModal = ({ isOpen, onClose, course }) => {
  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course.title}
      subtitle="Course Trailer & Preview Video"
      size="3xl"
    >
      <div className="space-y-4">
        <VideoPlayer
          videoUrl={course.preview_video_url || course.trailer_url || course.video_url}
          title={course.title}
        />
        {course.description && (
          <p className="text-xs text-slate-600 leading-relaxed">
            {course.description}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default CoursePreviewModal;
