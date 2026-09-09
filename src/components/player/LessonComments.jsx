import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { FormTextarea, Button } from "../common";
import { MessageSquare, Trash2, Send } from "lucide-react";

export const LessonComments = ({ lessonId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/learner/lessons/${lessonId}/comments`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      fetchComments();
    }
  }, [lessonId, fetchComments]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/learner/lessons/${lessonId}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/learner/lessons/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    }
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 space-y-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageSquare size={16} className="text-[#1f3b45]" />
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Discussion & Questions ({comments.length})
        </h4>
      </div>

      {/* Post comment input */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <FormTextarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          placeholder="Ask a question or share a thought regarding this lesson..."
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="xs"
            loading={submitting}
            icon={Send}
            iconPosition="right"
          >
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {loading ? (
          <p className="text-xs text-slate-400">Loading discussion...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No questions yet. Be the first to start the conversation!
          </p>
        ) : (
          comments.map((c) => {
            const isAuthor = user && (user.id === c.user_id || user.id === c.user?.id);
            return (
              <div
                key={c.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 group"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {c.user_name || c.user?.full_name || "Community Member"}
                    </span>
                    <span className="text-slate-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recently"}
                    </span>
                  </div>

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete your comment"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LessonComments;
