import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from './utils/supabase'
import { useEffect, useState } from 'react';
import Task from './components/task';
import type { Task as TaskType } from './utils/types';
import { SFSymbol } from "react-native-sfsymbols";


export default function App() {


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<TaskType[]>([])

  useEffect(() => {
    getTasks();

    const channel = supabase.channel('public:tasks')

    channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Change received!', payload)
          const newTask = payload.new as TaskType;
          const oldTask = payload.old as TaskType;

          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, newTask]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== oldTask.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Channel status:', status);
      });

    return () => {
      channel.unsubscribe();
    }
  }, []);

  const getTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  }

  const createTask = async () => {
    if (!title.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, description }])
      .select();

    if (error) {
      console.error('Error creating task:', error);
    } else {
      setTitle('');
      setDescription('');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View>
        <TextInput
          placeholder="Task Name"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Task Description"
          value={description}
          onChangeText={setDescription}
        />
        <Text
          style={{ marginTop: 20, color: 'blue' }}
          onPress={createTask}>Create Task
        </Text>
      </View>

      <SFSymbol
        name="thermometer.sun.fill"
        weight="semibold"
        scale="large"
        color="red"
        size={16}
        resizeMode="center"
        multicolor={false}
        style={{ width: 32, height: 32 }}
      />

      <FlatList
        style={{ marginTop: 40, width: '80%', overflow: 'hidden' }}
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Task {...item} />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});