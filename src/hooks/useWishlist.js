import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

let wishlistCache = null;
let wishlistPromise = null;

export function useWishlist(courseId) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !courseId) return;

    const checkWishlist = async () => {
      if (wishlistCache !== null) {
        setIsWishlisted(wishlistCache.includes(courseId));
        return;
      }

      if (!wishlistPromise) {
        wishlistPromise = api
          .get("/learner/wishlist")
          .then((res) => {
            wishlistCache = res.data.map((c) => c.id);
            return wishlistCache;
          })
          .catch((err) => {
            console.error("Error fetching wishlist", err);
            wishlistPromise = null;
            return [];
          });
      }

      const ids = await wishlistPromise;
      setIsWishlisted(ids.includes(courseId));
    };

    checkWishlist();
  }, [user, courseId]);

  const toggleWishlist = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!user) {
        return { requiresAuth: true };
      }

      setLoading(true);
      try {
        if (isWishlisted) {
          await api.delete(`/learner/wishlist/${courseId}`);
          setIsWishlisted(false);
          if (wishlistCache) {
            wishlistCache = wishlistCache.filter((id) => id !== courseId);
          }
        } else {
          await api.post(`/learner/wishlist/${courseId}`, {});
          setIsWishlisted(true);
          if (wishlistCache) {
            wishlistCache.push(courseId);
          }
        }
        return { success: true, isWishlisted: !isWishlisted };
      } catch (err) {
        console.error("Error toggling wishlist:", err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [user, courseId, isWishlisted]
  );

  return {
    isWishlisted,
    loading,
    toggleWishlist,
  };
}

export default useWishlist;
