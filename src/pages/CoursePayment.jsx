import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { ShieldCheck, BookOpen } from "lucide-react";

export default function CoursePayment() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Course info can come from router state (passed by CourseOverview)
  // or we fetch it if the user navigates directly
  const [course, setCourse] = useState(state?.course || null);
  const [loading, setLoading] = useState(!state?.course);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.course) {
      api
        .get(`/public/courses/${courseId}`)
        .then((res) => setCourse(res.data))
        .catch(() => navigate(`/courses/${courseId}`))
        .finally(() => setLoading(false));
    }
  }, [courseId, state, navigate]);

  // Redirect unauthenticated users to login
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
        image: "https://www.svarp.org/company/svarp-logo.webp",
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
      setError(
        err.response?.data?.detail ||
          "Failed to initiate payment. Please try again.",
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
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

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full bg-primary text-white py-3 rounded-full font-bold hover:opacity-90 transition disabled:opacity-50 text-lg"
            >
              {paying ? "Processing..." : `Pay ₹${course.price}`}
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
                  ₹{course.price}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{course.price}</span>
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
