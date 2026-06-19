import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shortenUrl } from '../services/api';
import AdvancedOptions from './AdvancedOptions';
import ResultDisplay from './ResultDisplay';

const UrlShortener = () => {
  const [shortened, setShortened] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { originalUrl: '', customAlias: '', expiresInDays: 30 }
  });

  const onSubmit = async (data) => {
    if (!data.originalUrl) {
      toast.error('Please enter a URL');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        originalUrl: data.originalUrl,
        expiresInDays: data.expiresInDays || 30,
      };
      if (data.customAlias) payload.customAlias = data.customAlias;

      const res = await shortenUrl(payload);
      setShortened(res.data);
      toast.success('Short URL created!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to shorten URL';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="url"
            placeholder="https://www.google.com"
            {...register('originalUrl', { required: 'URL is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              errors.originalUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.originalUrl && (
            <p className="text-red-500 text-sm mt-1 text-left">{errors.originalUrl.message}</p>
          )}
        </div>

        <AdvancedOptions register={register} watch={watch} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-70"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {shortened && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <ResultDisplay shortUrl={shortened.shortUrl} shortCode={shortened.shortCode} />
        </div>
      )}
    </div>
  );
};

export default UrlShortener;