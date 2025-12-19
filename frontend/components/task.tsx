import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';
import { borderRadius, colors, spacing } from '../utils/theme';
import type { Task } from '../utils/types';

export default function Task({id, title, description, created_at, isDone}: Task) {

  const toggleTask = (id: number) => async () => {
    const { error } = await supabase
      .from('tasks')
      .update({ isDone: !isDone })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
    }
  }

  const deleteTask = (id: number) => async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
    }
  }

    return (
        <View
            style={styles.container}
        >
            <Text>{title}</Text>
            <Text>{description}</Text>
            <Text>{new Date(created_at).toLocaleDateString()}</Text>
            <View style={styles.actions}>
                <Text onPress={toggleTask(id)} style={styles.checkButton}>
                    {isDone ? '✓' : '○'}
                </Text>
                <Text onPress={deleteTask(id)} style={styles.deleteButton}>X</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.gray100,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    checkButton: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    deleteButton: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});