import { Link } from "react-router-dom";

export default function PaymentSuccess() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7faff] px-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg text-center border border-gray-200">
        
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>

        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful!
        </h1>

        <p className="mt-3 text-gray-700 text-lg">
          You now have full access to your course.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block bg-[#FFCA3F] text-black font-semibold px-8 py-3 rounded-xl border-2 border-black shadow-md hover:bg-[#e6b835] transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
