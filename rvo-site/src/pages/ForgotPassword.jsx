import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Mock forgot password for now, since we haven't exposed resetPassword in AuthContext
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error('Failed to send reset link.');
    }
  };

  return (
    <div className="section-padding py-32 bg-ivory-white min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-forest-green/10 w-full max-w-md">
        <h2 className="text-3xl font-serif text-forest-green mb-6 text-center">Reset Password</h2>
        <p className="text-sm text-forest-green/70 text-center mb-6">
          Enter your email address to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest-green mb-1">Email</label>
            <input 
              {...register('email', { required: 'Email is required' })}
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-premium-gold focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <button type="submit" className="w-full premium-btn py-3 mt-4">Send Link</button>
        </form>
        <div className="mt-6 text-center text-sm text-forest-green/70">
          <p>Remembered your password? <Link to="/login" className="text-premium-gold hover:underline">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
