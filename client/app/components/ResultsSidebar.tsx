import { Link } from "react-router";

export default function ResultsSidebar() {
  return (
    <div className="w-1/4 min-h-screen bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
      {/* Logo/Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SmallTalk Trainer
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Home</span>
        </Link>

        <Link
          to="/results"
          className="flex items-center gap-3 px-4 py-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg"
        >
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Results</span>
        </Link>
      </nav>

      {/* Quick Stats Card */}
      <div className="mt-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          Session Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Status</span>
            <span className="text-green-400 text-sm font-medium">
              ✓ Complete
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Mode</span>
            <span className="text-white text-sm font-medium">Training</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Keep practicing to improve!
        </p>
      </div>
    </div>
  );
}
