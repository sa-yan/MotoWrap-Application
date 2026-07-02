// src/screens/LoginScreen.js

import { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
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
import { useTheme } from '../context/ThemeContext';

const LoginScreenComponent = () => {
    const { login, register } = useContext(AuthContext);
    const { colors, isDark, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const s = styles(colors);

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
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Theme toggle */}
                <TouchableOpacity style={s.themeBtn} onPress={toggleTheme} activeOpacity={0.7}>
                    <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
                </TouchableOpacity>

                {/* Brand */}
                <View style={s.brand}>
                    <View style={s.logoWrap}>
                        <Text style={s.logoEmoji}>🏍️</Text>
                    </View>
                    <Text style={s.appName}>MotoWrap</Text>
                    <Text style={s.tagline}>Track every ride. Own every road.</Text>
                </View>

                {/* Form card */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

                    {!isLogin && (
                        <View style={s.field}>
                            <Text style={s.fieldLabel}>YOUR NAME</Text>
                            <TextInput
                                style={s.input}
                                placeholder="Sayan"
                                placeholderTextColor={colors.placeholder}
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                            />
                        </View>
                    )}

                    <View style={s.field}>
                        <Text style={s.fieldLabel}>EMAIL</Text>
                        <TextInput
                            style={s.input}
                            placeholder="you@example.com"
                            placeholderTextColor={colors.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={s.field}>
                        <Text style={s.fieldLabel}>PASSWORD</Text>
                        <TextInput
                            style={s.input}
                            placeholder="••••••••"
                            placeholderTextColor={colors.placeholder}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[s.submitBtn, loading && s.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={s.submitBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://motowrap-backend-1.onrender.com/privacy').catch(() => {})}
                        style={s.privacyRow}
                        activeOpacity={0.7}
                    >
                        <Text style={s.privacyText}>
                            By continuing you agree to our <Text style={s.privacyLink}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading} style={s.switchRow}>
                        <Text style={s.switchText}>
                            {isLogin ? "Don't have an account? " : 'Already have one? '}
                            <Text style={s.switchLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },

    themeBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: c.bgCard,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    brand: { alignItems: 'center', marginBottom: 40 },
    logoWrap: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: c.accent + '1a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: c.accent,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    logoEmoji: { fontSize: 36 },
    appName: {
        fontSize: 40,
        fontWeight: '900',
        color: c.textPrimary,
        letterSpacing: -1.5,
        marginBottom: 6,
    },
    tagline: { fontSize: 14, color: c.textSecondary, fontWeight: '400' },

    card: {
        backgroundColor: c.bgCard,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: c.textPrimary,
        marginBottom: 24,
    },

    field: { marginBottom: 16 },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    input: {
        backgroundColor: c.bgInput,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 15,
        color: c.textPrimary,
        borderWidth: 1,
        borderColor: c.border,
    },

    submitBtn: {
        backgroundColor: c.accentDark,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: c.accentDark,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    privacyRow: { marginTop: 14, alignItems: 'center' },
    privacyText: { fontSize: 11, color: c.textMuted, textAlign: 'center' },
    privacyLink: { color: c.accent, fontWeight: '600' },

    switchRow: { marginTop: 20, alignItems: 'center' },
    switchText: { fontSize: 14, color: c.textSecondary },
    switchLink: { color: c.accent, fontWeight: '600' },
});

export const LoginScreen = LoginScreenComponent;
export default LoginScreen;
