import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-slate-300">
            The app hit an unexpected error. Try refreshing the page. If this keeps happening, clear
            local data from Settings.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
