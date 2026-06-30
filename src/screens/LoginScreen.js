// src/screens/LoginScreen.js

import { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreenComponent = () => {
    const { login, register } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) { Alert.alert('Error', 'Email and password required'); return; }
        if (!isLogin && !name) { Alert.alert('Error', 'Name required for registration'); return; }
        setLoading(true);
        try {
            if (isLogin) { await login(email, password); }
            else { await register(email, password, name); }
        } catch (error) {
            Alert.alert('Error', error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.brand}>
                    <View style={styles.logoRing}>
                        <Text style={styles.logoEmoji}>🏍️</Text>
                    </View>
                    <Text style={styles.title}>MotoWrap</Text>
                    <Text style={styles.subtitle}>Track every ride. Own every road.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.formTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

                    {!isLogin && (
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>NAME</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your name"
                                placeholderTextColor="#334155"
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                            />
                        </View>
                    )}

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>EMAIL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="#334155"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>PASSWORD</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#334155"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading} style={styles.toggle}>
                        <Text style={styles.toggleText}>
                            {isLogin ? "New here?  " : 'Already a rider?  '}
                            <Text style={styles.toggleLink}>{isLogin ? 'Create account' : 'Sign in'}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    brand: {
        alignItems: 'center',
        marginBottom: 44,
    },
    logoRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(59,130,246,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    logoEmoji: { fontSize: 34 },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#f1f5f9',
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    form: {
        backgroundColor: '#13131a',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    formTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#f1f5f9',
        marginBottom: 22,
    },
    inputWrapper: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 0.8,
        marginBottom: 7,
    },
    input: {
        backgroundColor: '#0d0d14',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#f1f5f9',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2563eb',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    toggle: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        color: '#475569',
    },
    toggleLink: {
        color: '#3b82f6',
        fontWeight: '600',
    },
});

export const LoginScreen = LoginScreenComponent;
export default LoginScreen;
