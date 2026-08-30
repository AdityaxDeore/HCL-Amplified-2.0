import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="text-[64px] font-bold text-[#1A1D21] mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page not found</h2>
      <p className="text-gray-500 mb-8 max-w-md">We couldn't find the page you were looking for. It might have been moved or doesn't exist.</p>
      <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
