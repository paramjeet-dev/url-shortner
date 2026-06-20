import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/api';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);
      login(res.data.user);
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      toast.success('Logged in!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800">Login to URL.to!</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="xyz@example.com"
            {...register('email', { required: 'Email is required' })}
            className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('password', { required: 'Password is required' })}
            className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600 text-sm">
        Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
      </p>
    </div>
  );
};

export default Login;