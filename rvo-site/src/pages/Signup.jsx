import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await signup(data.email, data.password, data.fullName);
      toast.success('Account created successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Failed to create account.');
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/profile');
    } catch (error) {
      toast.error('Google sign in failed.');
      console.error(error);
    }
  };

  return (
    <div className="section-padding py-32 bg-ivory-white min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-forest-green/10 w-full max-w-md">
        <h2 className="text-3xl font-serif text-forest-green mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest-green mb-1">Full Name</label>
            <input 
              {...register('fullName', { required: 'Name is required' })}
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-premium-gold focus:outline-none"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-green mb-1">Email</label>
            <input 
              {...register('email', { required: 'Email is required' })}
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-premium-gold focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-green mb-1">Password</label>
            <input 
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-premium-gold focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-green mb-1">Confirm Password</label>
            <input 
              {...register('confirmPassword', { 
                required: 'Please confirm password',
                validate: value => value === password || 'Passwords do not match' 
              })}
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-premium-gold focus:outline-none"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" className="w-full premium-btn py-3 mt-4">Sign Up</button>
        </form>

        <div className="relative mt-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-forest-green/70">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-forest-green font-medium"
        >
          <FcGoogle className="text-xl" /> Google
        </button>

        <div className="mt-6 text-center text-sm text-forest-green/70">
          <p>Already have an account? <Link to="/login" className="text-premium-gold hover:underline">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
