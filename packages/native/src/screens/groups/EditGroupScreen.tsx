import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 },
});

export default function EditGroupScreen({ route, navigation }: any) {
  const { state, dispatch } = useData();
  const groupId = route.params?.groupId;
  const group = groupId ? state.groups.find(g => g.id === groupId) : null;

  const [name, setName] = useState(group?.name || '');
  const [category, setCategory] = useState(group?.ageCategory || 'mixed');

  const handleSave = () => {
    if (!name.trim()) return;

    if (groupId) {
      dispatch({
        type: 'UPDATE_GROUP',
        payload: { ...group!, name, ageCategory: category as any },
      });
    } else {
      dispatch({
        type: 'ADD_GROUP',
        payload: { id: generateId(), name, ageCategory: category as any, athleteIds: [] },
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: COLORS.text }}>
        {groupId ? 'Edit Group' : 'Create Group'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Group name"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
