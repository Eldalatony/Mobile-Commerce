import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.replace('/products');
      }
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setError('');
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={loading ? '...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        onPress={handleSubmit}
        disabled={loading}
      />

      <View style={styles.spacer} />

      <Button
        title={mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        onPress={toggleMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  spacer: {
    height: 8,
  },
});
//documentation jwt tokens ask