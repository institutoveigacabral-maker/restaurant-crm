"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isNetwork =
        this.state.error?.message?.toLowerCase().includes("fetch") ||
        this.state.error?.message?.toLowerCase().includes("network");

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="bg-red-50 rounded-xl p-8 max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {this.props.title ?? "Algo deu errado"}
            </h2>
            <p className="text-red-600 text-sm mb-4">
              {isNetwork
                ? "Nao foi possivel conectar ao servidor. Verifique sua conexao."
                : "Ocorreu um erro inesperado. Tente novamente."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
