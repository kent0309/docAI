import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Document AI Processing System</h1>
        <p className="text-gray-600 mb-8 text-center">
          Upload, process, and extract data from your documents using AI
        </p>
        <div className="space-y-4">
          <Link href="/dashboard" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded block text-center">
            Go to Dashboard
          </Link>
          <Link href="/login"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded block text-center">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 