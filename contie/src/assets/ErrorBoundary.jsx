// ErrorBoundary.jsx
import { Component } from 'react';
import { toast } from 'react-hot-toast';

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    toast.error(`System Error: ${error.message}`);
  }

  render() {
    return this.state.hasError ? (
      <div className="text-red-500 p-8 text-center">
        Service temporarily unavailable. Please refresh the page.
      </div>
    ) : this.props.children;
  }
}