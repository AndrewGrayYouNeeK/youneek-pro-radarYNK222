import { useLocation, Link } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-[#00ff9c]/30">404</h1>
            <div className="h-0.5 w-16 bg-[#00ff9c]/20 mx-auto"></div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-white">
              Page Not Found
            </h2>
            <p className="text-white/60 leading-relaxed">
              The page <span className="font-medium text-white/80">"{pageName}"</span> could not be found.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#00ff9c] bg-black border border-[#00ff9c]/40 rounded-lg hover:bg-[#00ff9c]/10 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
