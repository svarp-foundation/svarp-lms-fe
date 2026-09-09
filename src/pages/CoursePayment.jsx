import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import API_URL, { getMediaUrl } from "../config";
import LearnerLayout from "../components/LearnerLayout";
import {
  ShieldCheck,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function CoursePayment() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(state?.course || null);
  const [loading, setLoading] = useState(!state?.course);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] = useState(null);

  // Coupon promo code states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await api.post("/course-payments/validate-coupon", {
        code: couponCode,
        course_id: parseInt(courseId),
      });
      if (res.data.valid) {
        setAppliedCoupon({
          id: res.data.coupon_id,
          code: couponCode.toUpperCase(),
          discount_amount: res.data.discount_amount,
        });
        setCouponSuccess(`Coupon '${couponCode.toUpperCase()}' applied successfully!`);
      } else {
        setCouponError(res.data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError(err.response?.data?.detail || "Failed to validate coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  useEffect(() => {
    if (!state?.course) {
      api
        .get(`/public/courses/${courseId}`)
        .then((res) => setCourse(res.data))
        .catch(() => navigate(`/courses/${courseId}`))
        .finally(() => setLoading(false));
    }
  }, [courseId, state, navigate]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleFreeEnrollment = async () => {
    setError("");
    setPaying(true);
    try {
      await api.post(`/learner/enroll/${courseId}`, {});
      navigate(`/courses/${courseId}/learn`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to enroll in the course. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handlePayment = async () => {
    setError("");
    setPaying(true);

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setError(
        "Razorpay SDK failed to load. Please check your internet connection.",
      );
      setPaying(false);
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await api.post(`/course-payments/create-order`, {
        course_id: parseInt(courseId),
        amount: course.price,
        currency: "INR",
        coupon_code: appliedCoupon?.code || null,
      });
      const orderData = orderRes.data;

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: orderData.app_name || "SVARP GLOBAL ACADEMY",
        description: `Course: ${course.title}`,
        image: window.location.origin + "/company/svarp-logo.png",
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/course-payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.status === "success") {
              navigate(`/courses/${courseId}/learn`);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setError(
              err.response?.data?.detail ||
                "Payment verification failed. Please contact support.",
            );
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user?.full_name || "",
          email: user?.email || "",
          contact: orderData.phone_number || "",
        },
        theme: {
          color: "#1f3b45",
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.detail?.readiness
      ) {
        setVerificationData(err.response.data.detail.readiness);
        setError("Profile verification required before payment.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to initiate payment. Please try again.",
        );
      }
      setPaying(false);
    }
  };

  const isReadyForPayment = !verificationData || verificationData.ready;

  if (loading) {
    return (
      <LearnerLayout>
        <div className="w-full bg-accent text-white page-padding relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col gap-1">
            <div className="h-8 bg-white/20 rounded-xl w-64 animate-pulse" />
            <div className="h-4 bg-white/10 rounded-md w-96 animate-pulse mt-1" />
          </div>
        </div>
        <div className="page-padding max-w-7xl mx-auto py-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6 border border-gray-100">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md w-full" />
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-full" />
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4 border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-100 rounded-xl w-full" />
              <div className="h-12 bg-primary/30 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  if (!course) return null;

  return (
    <LearnerLayout>
      {/* Page Header Banner */}
      <div className="w-full bg-accent text-white page-padding relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            Complete Your Enrollment
          </h1>
          <p className="text-gray-300 text-sm max-w-lg">
            Secure checkout for lifetime access to course materials and certificates.
          </p>
        </div>
      </div>

      <div className="page-padding max-w-7xl mx-auto py-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left: Course Info + Payment Action */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-start gap-4">
              {course.thumbnail_url ? (
                <img
                  src={getMediaUrl(course.thumbnail_url)}
                  alt={course.title}
                  className="w-20 h-20 rounded-xl object-fill flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {course.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Important Guidelines */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-sm text-blue-800">
              <h4 className="font-medium text-blue-900 mb-1">Before You Pay</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not refresh or close the browser during payment.</li>
                <li>Ensure your internet connection is stable.</li>
                <li>
                  You will be enrolled immediately upon successful payment.
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Verification Status Section */}
            {!isReadyForPayment && verificationData && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-amber-900 font-bold text-lg">
                  <AlertCircle size={24} className="text-amber-500" />
                  Profile Verification Required
                </div>
                <p className="text-amber-800 text-sm">
                  Please complete the following details in your profile before
                  you can proceed with the payment:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { key: "has_full_name", label: "Full Name" },
                    { key: "has_phone_number", label: "Phone Number" },
                    { key: "has_pan_card", label: "PAN Card" },
                    { key: "has_address", label: "Address" },
                    { key: "has_city", label: "City" },
                    { key: "has_state", label: "State" },
                    { key: "has_government_id_doc", label: "Government ID" },
                    {
                      key: "has_profile_picture_doc",
                      label: "Profile Picture",
                    },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      {verificationData[item.key] ? (
                        <CheckCircle2
                          size={16}
                          className="text-green-500 flex-shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="text-red-500 flex-shrink-0"
                        />
                      )}
                      <span
                        className={
                          verificationData[item.key]
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full mt-2 bg-amber-100 text-amber-900 py-2 rounded-xl font-semibold hover:bg-amber-200 transition"
                >
                  Go to Profile Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit space-y-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between border-b pb-4">
                <span>Course</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">
                  {course.title}
                </span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span>Price</span>
                <span className="font-medium text-gray-900">
                  ₹{course.price.toFixed(2)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between border-b pb-4 text-green-600 font-medium">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {course.discounted_price === 0 && (
                <div className="flex justify-between border-b pb-4 text-green-600 font-medium">
                  <span>Member Discount</span>
                  <span>-₹{course.price.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-4">
                <span>GST (18%)</span>
                <span className="font-medium text-gray-900">
                  ₹
                  {course.discounted_price === 0
                    ? "0.00"
                    : (Math.max(0, course.price - (appliedCoupon?.discount_amount || 0)) * 0.18).toFixed(2)}
                </span>
              </div>
              
              {/* Promo Code Input Box */}
              {course.discounted_price !== 0 && (
                <div className="border-b pb-4 flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary uppercase flex-1"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-green-600 font-bold">{couponSuccess}</p>}
                </div>
              )}

              <div className="flex justify-between pt-2 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>
                  ₹
                  {course.discounted_price === 0
                    ? "0.00"
                    : (Math.max(0, course.price - (appliedCoupon?.discount_amount || 0)) * 1.18).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Action Button moved after details */}
            <button
              onClick={
                course.discounted_price === 0
                  ? handleFreeEnrollment
                  : handlePayment
              }
              disabled={paying || !isReadyForPayment}
              className="w-full bg-primary text-white py-3.5 rounded-2xl font-extrabold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              {paying
                ? "Processing..."
                : isReadyForPayment
                  ? course.discounted_price === 0
                    ? "Enroll for Free"
                    : `Pay ₹${(Math.max(0, course.price - (appliedCoupon?.discount_amount || 0)) * 1.18).toFixed(2)}`
                  : "Complete Profile to Pay"}
            </button>

            <div className="mt-8 bg-green-50 p-4 rounded-xl text-xs text-green-800 flex items-start gap-2">
              <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Secure Payment</p>
                <p>
                  Your payment information is encrypted and processed securely
                  by Razorpay.
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>✓ Full lifetime access after enrollment</p>
              <p>✓ Certificate of completion</p>
              <p>✓ Access on all devices</p>
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
}
