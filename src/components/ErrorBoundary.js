// src/components/ErrorBoundary.js

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.log('App crashed:', error, info?.componentStack);
    }

    reset = () => this.setState({ hasError: false });

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>⚠️</Text>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.body}>
                        The app hit an unexpected error. You can try again — if it keeps happening, restart the app.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.reset} activeOpacity={0.85}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f17',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emoji: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800', color: '#eeeef8', marginBottom: 10 },
    body: { fontSize: 14, color: '#8888aa', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    button: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
