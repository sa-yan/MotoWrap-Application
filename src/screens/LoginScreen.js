// src/screens/LoginScreen.js

import { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

const LoginScreenComponent = () => {
    const { login, register } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password required');
            return;
        }

        if (!isLogin && !name) {
            Alert.alert('Error', 'Name required for registration');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            Alert.alert('Success', isLogin ? 'Logged in!' : 'Registered & logged in!');
        } catch (error) {
            Alert.alert('Error', error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MotoWrap</Text>
                <Text style={styles.subtitle}>Ride Tracking for Motorcycle Lovers</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!loading}
                />

                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isLogin ? 'Login' : 'Register'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
                    <Text style={styles.toggleText}>
                        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 50,
        paddingHorizontal: theme.spacing.lg,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: theme.colors.primary,
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    form: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
    },
    input: {
        ...theme.patterns.inputBase,
        marginBottom: theme.spacing.md,
        color: theme.colors.text,
        borderColor: theme.colors.border,
    },
    button: {
        ...theme.patterns.buttonBase,
        backgroundColor: theme.colors.primary,
        marginTop: theme.spacing.xl,
        ...theme.shadows.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    toggleText: {
        color: theme.colors.primary,
        textAlign: 'center',
        marginTop: theme.spacing.xl,
        fontSize: 14,
        fontWeight: '500',
    },
});

export const LoginScreen = LoginScreenComponent;
export default LoginScreen;