import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-muted py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">
          Complete Your Enrollment
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Course Info + Payment Action */}
          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
            <div className="flex items-start gap-4">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
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

            <button
              onClick={
                course.discounted_price === 0
                  ? handleFreeEnrollment
                  : handlePayment
              }
              disabled={paying || !isReadyForPayment}
              className="w-full bg-primary text-white py-3 rounded-full font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {paying
                ? "Processing..."
                : isReadyForPayment
                  ? course.discounted_price === 0
                    ? "Enroll for Free"
                    : `Pay ₹${(course.price * 1.18).toFixed(2)}`
                  : "Complete Profile to Pay"}
            </button>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-lg h-fit">
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
                    : (course.price * 0.18).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>
                  ₹
                  {course.discounted_price === 0
                    ? "0.00"
                    : (course.price * 1.18).toFixed(2)}
                </span>
              </div>
            </div>

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
    </div>
  );
}
