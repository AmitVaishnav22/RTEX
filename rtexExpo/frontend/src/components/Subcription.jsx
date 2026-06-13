import { useState , useEffect} from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function Subscription() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("rtexSubscribed") === "true";
  });
  const OTP_TIME = 60; // 1 minute
  const [timeLeft, setTimeLeft] = useState(OTP_TIME);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (step !== 2) return;

    if (timeLeft <= 0) {
      setCanRetry(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("entered")

    try {
      const res = await fetch("https://rtex-1.onrender.com/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep(2);
      setTimeLeft(OTP_TIME);
      setCanRetry(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://rtex-1.onrender.com/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      localStorage.setItem("rtexSubscribed", "true");
      setIsSubscribed(true);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  if (isSubscribed){
    return (
      <>
      <motion.div
          className="w-full max-w-lg mx-auto rounded-2xl bg-black shadow-xl p-8 mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 className="text-green-500 mx-auto mb-4" size={50} />

          <h2 className="text-2xl font-bold mb-3">
            You are subscribed 🎉
          </h2>

          <p className="text-gray-400">
            You are subscribed and will receive email notifications every Sunday.
          </p>
        </motion.div>
      </>
    )
  }
  return (
    <>
    <motion.div
      className="w-full max-w-lg mx-auto rounded-2xl bg-black shadow-xl p-8 mb-10 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {step === 1 && (
        <>
          <Mail className="mx-auto mb-4 text-blue-400" size={40} />
          <h2 className="text-2xl font-bold mb-2">Subscribe for RTEX Updates</h2>
          <p className="text-gray-400 mb-6">
            Get notified when new exports are added or when top weekly lists drop.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold transition"
            >
              {loading ? (
                <Loader2 className="animate-spin inline-block" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-400 mb-6">
            We’ve sent a 6-digit OTP to <span className="text-blue-400">{email}</span>
          </p>
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-center tracking-widest"
            />
            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold transition"
            >
              {loading ? (
                <Loader2 className="animate-spin inline-block" />
              ) : (
                "Verify"
              )}
            </button>
            <div className="mt-4 text-center">
              {!canRetry ? (
                <p className="text-sm text-gray-400">
                  Retry available in{" "}
                  <span className="text-blue-400 font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="text-blue-500 hover:text-blue-400 underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <CheckCircle2 className="text-green-500 mb-4" size={50} />
          <h2 className="text-2xl font-bold mb-2">Subscription Complete</h2>
          <p className="text-gray-400">
            You’ll start receiving updates every weekend.  <br />
            Welcome to the RTex Expo community!
          </p>
        </motion.div>
      )}
      {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}
    </motion.div>
    </>
  );
}
