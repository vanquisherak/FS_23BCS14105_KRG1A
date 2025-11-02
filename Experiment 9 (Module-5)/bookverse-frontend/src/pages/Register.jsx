import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { save } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/users/register', formData);
      save(res.data.token, res.data.user);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 via-magenta to-aurora">
            <Sparkles className="h-8 w-8 text-slate-950" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-aurora bg-clip-text text-transparent">
              Join the Network
            </h1>
            <p className="text-slate/60">
              Connect with fellow readers and share your literary discoveries
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate/80">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate/40" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate/50 focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-colors"
                  placeholder="How should we address you?"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate/80">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate/50 focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate/80">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate/40" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate/50 focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-colors"
                  placeholder="Enter a secure password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span className="text-sm text-rose-300">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <NeonButton
              type="submit"
              disabled={loading}
              className="w-full group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Profile
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </NeonButton>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate/60">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate/40">
            By joining, you agree to share your literary insights with fellow explorers
          </p>
        </div>
      </div>
    </div>
  );
}
