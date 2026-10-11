import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(formData.username, formData.email, formData.password);
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login', { state: { message: 'Registration successful. Please sign in.' } }), 1800);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.09,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0B0B14]">
      {/* Background Gradient & Ambient Glows matching reference */}
      <div className="bg-reference" aria-hidden="true">
        <div className="star-dust" />
        <div className="glow-purple-top-left" />
        <div className="glow-orange-bottom-right" />
      </div>

      {/* Main Glassmorphism Card (35% larger size, ~520px width) */}
      <motion.div
        className="w-full max-w-[520px] relative z-10 my-auto"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          className="reference-glass-card p-8 sm:p-12 relative overflow-hidden"
        >
          {/* Top Edge Purple Shimmer Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

          {/* AI Logo Badge Header */}
          <motion.div className="flex flex-col items-center mb-8 text-center" variants={itemVariants}>
            <motion.div
              className="w-20 h-20 rounded-[22px] bg-gradient-to-tr from-[#6342FF] via-[#7B46FF] to-[#9254FF] p-[1px] shadow-[0_0_30px_rgba(124,77,255,0.45)] mb-5 flex items-center justify-center relative group cursor-pointer"
              whileHover={{ scale: 1.07, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            >
              <div className="w-full h-full bg-[#7551FF] rounded-[21px] flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Robot Icon SVG matching reference */}
                <svg
                  className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="10" rx="3" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="15" x2="8" y2="15.01" strokeWidth="3" />
                  <line x1="16" y1="15" x2="16" y2="15.01" strokeWidth="3" />
                  <path d="M9 18c.5.5 1.5 1 3 1s2.5-.5 3-1" />
                </svg>
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
              AI Chatbot
            </h1>
            <p className="text-base text-purple-200/50 font-normal">
              Create an account to get started
            </p>
          </motion.div>

          {/* Alert Banners */}
          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-4 py-3.5 rounded-2xl text-sm font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-4 py-3.5 rounded-2xl text-sm font-medium bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-center gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-purple-200/70 mb-2 pl-1.5">
                Username
              </label>
              <div className="relative group">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  minLength={3}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="reference-input w-full h-14 pl-7 pr-4.5 text-base"
                />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200/70 mb-2 pl-1.5">
                Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="reference-input w-full h-14 pl-7 pr-4.5 text-base"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200/70 mb-2 pl-1.5">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="reference-input w-full h-14 pl-7 pr-4.5 text-base"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-3">
              <motion.button
                type="submit"
                disabled={isSubmitting || success !== ''}
                whileHover={{ scale: 1.015, boxShadow: '0 8px 32px rgba(124, 77, 255, 0.55)' }}
                whileTap={{ scale: 0.985 }}
                className="w-full h-14 px-6 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[#6342FF] via-[#7B46FF] to-[#8C52FF] shadow-[0_6px_24px_rgba(124,77,255,0.4)] flex items-center justify-center relative transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 relative z-10 w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>
                      <span className="mx-auto">Create account</span>
                      <ArrowRight className="w-5 h-5 absolute right-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative flex items-center py-3">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink-0 mx-4 text-xs font-normal text-white/30 uppercase tracking-widest">
                or
              </span>
              <div className="flex-grow border-t border-white/10" />
            </motion.div>

            {/* Footer / Sign In Link */}
            <motion.p variants={itemVariants} className="text-center text-sm text-purple-200/50 font-normal">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#9D8CFF] font-medium hover:text-white transition-colors hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
