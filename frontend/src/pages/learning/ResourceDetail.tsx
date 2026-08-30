import { useParams } from 'react-router-dom';

export default function ResourceDetail() {
  const params = useParams();
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-[#1A1D21] mb-4">Resource Detail</h1>
      <p className="text-lg text-gray-500 mb-6">Viewing a specific learning resource.</p>
      {Object.keys(params).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 font-mono shadow-sm">
          URL Parameters: {JSON.stringify(params, null, 2)}
        </div>
      )}
    </div>
  );
}
