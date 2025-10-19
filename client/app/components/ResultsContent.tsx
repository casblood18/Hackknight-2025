import { Link } from "react-router";

export default function ResultsContent() {
  return (
    <div className="w-3/4 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Training Complete!
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed text-center">
          Great job! You've completed your conversation training session.
        </p>

        {/* Stats Grid */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Session Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                ✓
              </div>
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-white font-semibold">Completed</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                🎯
              </div>
              <div className="text-gray-400 text-sm mb-1">Practice</div>
              <div className="text-white font-semibold">Makes Perfect</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                🚀
              </div>
              <div className="text-gray-400 text-sm mb-1">Progress</div>
              <div className="text-white font-semibold">Keep Going</div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 mb-10">
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center justify-center gap-2">
            <span>💡</span>
            <span>Pro Tip</span>
          </h3>
          <p className="text-gray-300 text-center">
            Regular practice helps build confidence in real conversations. Try
            different scenarios to improve various social situations!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="group relative px-10 py-4 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105 text-center"
          >
            <span className="flex items-center justify-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Start New Training
            </span>
          </Link>

          <Link
            to="/"
            className="px-10 py-4 text-lg font-semibold text-gray-300 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all duration-300 text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
