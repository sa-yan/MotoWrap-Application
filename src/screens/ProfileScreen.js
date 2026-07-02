// src/screens/ProfileScreen.js

import { useCallback, useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, bikeAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';

export const ProfileScreen = ({ navigation }) => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const { colors } = useTheme();
    const s = styles(colors);

    // Profile state — loaded from API so we get createdAt + latest name
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState(user?.name ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Bikes state
    const [bikes, setBikes] = useState([]);
    const [loadingBikes, setLoadingBikes] = useState(true);

    // Account deletion state
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Load profile once on mount
    useEffect(() => {
        userAPI.getProfile()
            .then(res => {
                setProfile(res.data);
                setName(res.data.name);
            })
            .catch(() => {
                // Fallback to stored user data if API fails
                setName(user?.name ?? '');
            });
    }, []);

    // Reload bikes every time the screen is focused (catches BikeForm saves)
    useFocusEffect(
        useCallback(() => { fetchBikes(); }, [])
    );

    const fetchBikes = async () => {
        setLoadingBikes(true);
        try {
            const res = await bikeAPI.getBikes();
            setBikes(res.data);
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to load bikes'));
        } finally {
            setLoadingBikes(false);
        }
    };

    const saveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }
        const payload = { name: name.trim() };
        if (currentPassword && newPassword) {
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
        } else if (currentPassword || newPassword) {
            Alert.alert('Error', 'Fill in both current and new password to change it');
            return;
        }
        setSavingProfile(true);
        try {
            const res = await userAPI.updateProfile(payload);
            await updateUser({ name: res.data.name });
            setCurrentPassword('');
            setNewPassword('');
            Alert.alert('Saved', 'Profile updated successfully');
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to update profile'));
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSetDefault = async (bikeId) => {
        try {
            await bikeAPI.setDefault(bikeId);
            await fetchBikes();
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to set default'));
        }
    };

    const handleDeleteBike = (bike) => {
        Alert.alert(
            'Delete Bike',
            `Remove "${bike.nickname}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bikeAPI.deleteBike(bike.id);
                            await fetchBikes();
                        } catch (e) {
                            Alert.alert('Error', getErrorMessage(e, 'Failed to delete bike'));
                        }
                    },
                },
            ]
        );
    };

    const openPrivacyPolicy = () => {
        Linking.openURL('https://motowrap-backend-1.onrender.com/privacy')
            .catch(() => Alert.alert('Error', 'Could not open Privacy Policy'));
    };

    const performDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            await userAPI.deleteAccount();
            await logout();
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to delete account'));
        } finally {
            setDeletingAccount(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This permanently deletes your account, all rides, GPS data, and bikes. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you absolutely sure?',
                            'Your data will be gone forever.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete Everything',
                                    style: 'destructive',
                                    onPress: performDeleteAccount,
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const joined = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : null;

    return (
        <View style={s.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Profile</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* Avatar */}
                <View style={s.avatarSection}>
                    <View style={s.avatar}>
                        <Text style={s.avatarInitial}>{(name || 'R')[0].toUpperCase()}</Text>
                    </View>
                    <Text style={s.emailText}>{user?.email}</Text>
                    {joined && <Text style={s.joinedText}>Rider since {joined}</Text>}
                </View>

                {/* Edit Account */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>ACCOUNT INFO</Text>

                    <View style={s.fieldRow}>
                        <Text style={s.fieldLabel}>NAME</Text>
                        <TextInput
                            style={s.fieldInput}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={colors.placeholder}
                            returnKeyType="done"
                        />
                    </View>

                    <View style={s.divider} />

                    <View style={s.fieldRow}>
                        <Text style={s.fieldLabel}>CURRENT PASSWORD</Text>
                        <TextInput
                            style={s.fieldInput}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Leave blank to keep"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry
                        />
                    </View>

                    <View style={s.divider} />

                    <View style={s.fieldRow}>
                        <Text style={s.fieldLabel}>NEW PASSWORD</Text>
                        <TextInput
                            style={s.fieldInput}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Min 6 characters"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[s.saveBtn, savingProfile && s.disabled]}
                        onPress={saveProfile}
                        disabled={savingProfile}
                        activeOpacity={0.85}
                    >
                        {savingProfile
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={s.saveBtnText}>Save Changes</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* My Bikes */}
                <View style={s.section}>
                    {/* Section header row — title + Add button side by side */}
                    <View style={s.bikeSectionHeader}>
                        <Text style={s.bikeSectionTitle}>MY BIKES</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BikeForm', { bike: null })}
                            style={s.addBikeBtn}
                        >
                            <Text style={s.addBikeBtnText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingBikes ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator color={colors.accent} />
                        </View>
                    ) : bikes.length === 0 ? (
                        <View style={s.emptyBikes}>
                            <Text style={s.emptyBikesText}>No bikes yet. Add your first one!</Text>
                        </View>
                    ) : (
                        bikes.map((bike, index) => (
                            <View key={bike.id}>
                                {index > 0 && <View style={s.divider} />}
                                <View style={s.bikeRow}>
                                    <View style={s.bikeInfo}>
                                        <View style={s.bikeNameRow}>
                                            <Text style={s.bikeName}>{bike.nickname}</Text>
                                            {bike.isDefault && (
                                                <View style={s.defaultBadge}>
                                                    <Text style={s.defaultBadgeText}>DEFAULT</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={s.bikeMeta}>
                                            {[bike.make, bike.model, bike.year ? String(bike.year) : null]
                                                .filter(Boolean).join(' · ') || 'No details'}
                                        </Text>
                                        {(bike.engineCC || bike.color) && (
                                            <Text style={s.bikeDetail}>
                                                {[bike.engineCC ? `${bike.engineCC}cc` : null, bike.color]
                                                    .filter(Boolean).join(' · ')}
                                            </Text>
                                        )}
                                        {bike.licensePlate && (
                                            <Text style={s.bikePlate}>{bike.licensePlate}</Text>
                                        )}
                                    </View>
                                    <View style={s.bikeActions}>
                                        {!bike.isDefault && (
                                            <TouchableOpacity
                                                style={s.bikeActionBtn}
                                                onPress={() => handleSetDefault(bike.id)}
                                            >
                                                <Text style={s.actionIconDefault}>★</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={s.bikeActionBtn}
                                            onPress={() => navigation.navigate('BikeForm', { bike })}
                                        >
                                            <Text style={s.actionIconEdit}>✎</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={s.bikeActionBtn}
                                            onPress={() => handleDeleteBike(bike)}
                                        >
                                            <Text style={s.actionIconDelete}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Bottom padding inside card */}
                    <View style={{ height: 8 }} />
                </View>

                {/* Legal + Danger Zone */}
                <View style={[s.section, s.dangerSection]}>
                    <Text style={s.sectionTitle}>PRIVACY & ACCOUNT</Text>

                    <TouchableOpacity style={s.linkRow} onPress={openPrivacyPolicy} activeOpacity={0.7}>
                        <Text style={s.linkRowText}>Privacy Policy</Text>
                        <Text style={s.linkRowArrow}>›</Text>
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity
                        style={s.linkRow}
                        onPress={handleDeleteAccount}
                        disabled={deletingAccount}
                        activeOpacity={0.7}
                    >
                        {deletingAccount
                            ? <ActivityIndicator color="#ef4444" size="small" />
                            : <Text style={s.deleteAccountText}>Delete Account</Text>
                        }
                    </TouchableOpacity>
                    <Text style={s.dangerHint}>
                        Permanently deletes your account, all rides, GPS data, and bikes.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center' },
    backArrow: { fontSize: 28, color: c.accent, fontWeight: '300', lineHeight: 32 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: c.textPrimary },

    scroll: { paddingBottom: 40 },

    avatarSection: { alignItems: 'center', paddingVertical: 28 },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: c.accent + '22',
        borderWidth: 2,
        borderColor: c.accent + '44',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarInitial: { fontSize: 30, fontWeight: '800', color: c.accent },
    emailText: { fontSize: 14, color: c.textSecondary, fontWeight: '500' },
    joinedText: { fontSize: 12, color: c.textMuted, marginTop: 4 },

    section: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: c.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.border,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.5,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },

    // Bikes section header — separate from sectionTitle to avoid double padding
    bikeSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    bikeSectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.5,
    },
    addBikeBtn: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        backgroundColor: c.accent + '18',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.accent + '33',
    },
    addBikeBtnText: { fontSize: 13, fontWeight: '700', color: c.accent },

    divider: { height: 1, backgroundColor: c.divider, marginHorizontal: 20 },

    fieldRow: { paddingHorizontal: 20, paddingVertical: 14 },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    fieldInput: { fontSize: 15, color: c.textPrimary, fontWeight: '500' },

    saveBtn: {
        margin: 16,
        backgroundColor: c.accentDark,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    disabled: { opacity: 0.5 },

    loadingBox: { paddingVertical: 30, alignItems: 'center' },
    emptyBikes: { paddingHorizontal: 20, paddingVertical: 16 },
    emptyBikesText: { fontSize: 14, color: c.textMuted, textAlign: 'center' },

    bikeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    bikeInfo: { flex: 1 },
    bikeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
    bikeName: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    defaultBadge: {
        backgroundColor: c.accent + '18',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.accent + '33',
    },
    defaultBadgeText: { fontSize: 9, fontWeight: '700', color: c.accent, letterSpacing: 0.5 },
    bikeMeta: { fontSize: 13, color: c.textSecondary, marginBottom: 2 },
    bikeDetail: { fontSize: 12, color: c.textMuted },
    bikePlate: {
        fontSize: 11,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1,
        marginTop: 3,
    },

    bikeActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    bikeActionBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: c.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.border,
    },
    actionIconDefault: { fontSize: 15, color: '#f59e0b' },
    actionIconEdit: { fontSize: 15, color: c.accent },
    actionIconDelete: { fontSize: 13, color: '#ef4444' },

    dangerSection: { borderColor: '#ef444433' },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    linkRowText: { fontSize: 15, fontWeight: '500', color: c.textPrimary },
    linkRowArrow: { fontSize: 20, color: c.textMuted, fontWeight: '300' },
    deleteAccountText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
    dangerHint: {
        fontSize: 11,
        color: c.textMuted,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
});

export default ProfileScreen;
