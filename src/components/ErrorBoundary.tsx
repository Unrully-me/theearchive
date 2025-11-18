import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 text-white p-6">
          <div className="max-w-xl text-center">
            <h3 className="text-2xl font-black mb-4">An error occurred</h3>
            <p className="text-sm text-gray-300 mb-4">{this.state.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#FFD700] rounded font-bold text-black">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
