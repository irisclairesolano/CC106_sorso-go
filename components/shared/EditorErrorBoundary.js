'use client';

import { Component } from 'react';

class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Editor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border rounded bg-red-50 text-red-700">
          <p>Something went wrong with the editor. Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;
