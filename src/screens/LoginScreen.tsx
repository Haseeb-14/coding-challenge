import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {
  loginWithEmail,
  loginWithGoogle,
  clearError,
} from '../store/slices/authSlice';
import {Colors} from '../constants/colors';
import {Spacing, FontSize} from '../constants/dimensions';
import {validation} from '../utils/validation';
import {AUTH_CONFIG} from '../constants/app';
import {Button, Input} from '../components';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {isLoading, error} = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>(AUTH_CONFIG.TEST_EMAIL);
  const [password, setPassword] = useState<string>(AUTH_CONFIG.TEST_PASSWORD);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!validation.email(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError(null);
    }

    // Validate password
    if (!validation.password(password)) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(loginWithEmail({email, password})).unwrap();
    } catch (err) {
      console.log('EMAIL LOGIN ERROR', err);
      // Error is handled in useEffect
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
    } catch (err) {
      console.log('GOOGLE LOGIN ERROR', err);

      // Error is handled in useEffect
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to PerDiem</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              error={emailError}
              required
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              error={passwordError}
              required
            />

            {/* Login Button */}
            <Button
              title={isLoading ? 'Signing In...' : 'Sign In'}
              onPress={handleEmailLogin}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <Button
              title="Sign in with Google"
              variant="outline"
              onPress={handleGoogleLogin}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.largeTitle,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginBottom: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md,
  },
});

export default LoginScreen;
