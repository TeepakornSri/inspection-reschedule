import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            maxWidth: "600px",
            margin: "50px auto",
            border: "1px solid red",
            backgroundColor: "#ffe6e6",
            borderRadius: "5px",
          }}
        >
          <h2>Something went wrong! 🚨</h2>
          <p>{this.state.error?.message || "Unknown error occurred."}</p>
          <pre style={{ textAlign: "left", overflowX: "auto" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
