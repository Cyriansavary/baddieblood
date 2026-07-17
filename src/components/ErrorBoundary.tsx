import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff2f8', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#5c1736', marginBottom: 8, textAlign: 'center' }}>
          Quelque chose s'est mal passé
        </Text>
        <Text style={{ fontSize: 14, color: '#8a4060', lineHeight: 20, textAlign: 'center', marginBottom: 24 }}>
          Une erreur inattendue s'est produite. Tes données locales sont préservées.
        </Text>
        <Pressable
          onPress={this.reset}
          style={{ backgroundColor: '#7d1d4f', borderRadius: 20, paddingHorizontal: 28, paddingVertical: 14 }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Réessayer</Text>
        </Pressable>
        {Boolean(this.state.message) && (
          <Text style={{ fontSize: 11, color: '#b07090', marginTop: 20, textAlign: 'center' }}>
            {this.state.message}
          </Text>
        )}
      </SafeAreaView>
    );
  }
}
