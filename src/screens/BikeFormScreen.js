// src/screens/BikeFormScreen.js

import { useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { bikeAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';

export const BikeFormScreen = ({ route, navigation }) => {
    const { bike } = route.params; // null = create, object = edit
    const isEdit = bike != null;
    const { colors } = useTheme();
    const s = styles(colors);

    const [nickname, setNickname] = useState(bike?.nickname ?? '');
    const [make, setMake] = useState(bike?.make ?? '');
    const [model, setModel] = useState(bike?.model ?? '');
    const [year, setYear] = useState(bike?.year ? String(bike.year) : '');
    const [engineCC, setEngineCC] = useState(bike?.engineCC ? String(bike.engineCC) : '');
    const [color, setColor] = useState(bike?.color ?? '');
    const [licensePlate, setLicensePlate] = useState(bike?.licensePlate ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!nickname.trim()) {
            Alert.alert('Required', 'Nickname is required');
            return;
        }
        const payload = {
            nickname: nickname.trim(),
            make: make.trim() || null,
            model: model.trim() || null,
            year: year ? parseInt(year, 10) : null,
            engineCC: engineCC ? parseInt(engineCC, 10) : null,
            color: color.trim() || null,
            licensePlate: licensePlate.trim() || null,
        };
        setSaving(true);
        try {
            if (isEdit) {
                await bikeAPI.updateBike(bike.id, payload);
            } else {
                await bikeAPI.createBike(payload);
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to save bike'));
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, value, onChangeText, placeholder, keyboardType, maxLength }) => (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={s.fieldInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                keyboardType={keyboardType ?? 'default'}
                maxLength={maxLength}
                returnKeyType="next"
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={s.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>{isEdit ? 'Edit Bike' : 'Add Bike'}</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={s.card}>
                    <Text style={s.cardSectionLabel}>IDENTITY</Text>

                    <Field
                        label="NICKNAME *"
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder='e.g. "My Duke"'
                    />
                    <View style={s.divider} />
                    <Field
                        label="MAKE"
                        value={make}
                        onChangeText={setMake}
                        placeholder="e.g. KTM, Royal Enfield"
                    />
                    <View style={s.divider} />
                    <Field
                        label="MODEL"
                        value={model}
                        onChangeText={setModel}
                        placeholder="e.g. Duke 390"
                    />
                    <View style={s.divider} />
                    <Field
                        label="YEAR"
                        value={year}
                        onChangeText={setYear}
                        placeholder="e.g. 2023"
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </View>

                <View style={s.card}>
                    <Text style={s.cardSectionLabel}>DETAILS</Text>

                    <Field
                        label="ENGINE (CC)"
                        value={engineCC}
                        onChangeText={setEngineCC}
                        placeholder="e.g. 390"
                        keyboardType="number-pad"
                        maxLength={5}
                    />
                    <View style={s.divider} />
                    <Field
                        label="COLOR"
                        value={color}
                        onChangeText={setColor}
                        placeholder="e.g. Supermoto Orange"
                    />
                    <View style={s.divider} />
                    <Field
                        label="LICENSE PLATE"
                        value={licensePlate}
                        onChangeText={setLicensePlate}
                        placeholder="e.g. WB 01 AB 1234"
                        maxLength={20}
                    />
                </View>

                <TouchableOpacity
                    style={[s.saveBtn, saving && s.disabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                >
                    {saving
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.saveBtnText}>{isEdit ? 'Update Bike' : 'Add Bike'}</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
    scroll: { padding: 16, paddingBottom: 40 },

    card: {
        backgroundColor: c.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.border,
        overflow: 'hidden',
        marginBottom: 16,
    },
    cardSectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.5,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    field: { paddingHorizontal: 20, paddingVertical: 14 },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    fieldInput: {
        fontSize: 15,
        color: c.textPrimary,
        fontWeight: '500',
    },
    divider: { height: 1, backgroundColor: c.divider, marginHorizontal: 20 },

    saveBtn: {
        backgroundColor: c.accentDark,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
        shadowColor: c.accentDark,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    disabled: { opacity: 0.5 },
});

export default BikeFormScreen;
