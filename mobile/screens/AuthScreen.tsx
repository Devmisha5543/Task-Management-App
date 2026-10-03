import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileApiRequest, setAuthToken } from "../lib/api";
import type { User } from "../types/auth";
import Icon from "../components/Icon";

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Field-level error states (Tell 4)
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Specific high-level error states (Tell 4)
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(900); // 15 mins
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockedOut && lockoutSecondsLeft > 0) {
      timer = setInterval(() => {
        setLockoutSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSecondsLeft]);

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const validate = () => {
    let valid = true;
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);

    if (!isLoginMode) {
      if (!username.trim()) {
        setUsernameError("Username is required");
        valid = false;
      } else if (username.trim().length < 3) {
        setUsernameError("Username must be at least 3 characters");
        valid = false;
      }
    }

    if (!email.trim()) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address (e.g. name@domain.com)");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (!isLoginMode && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (isLockedOut) return;
    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);
    setIsUnverified(false);
    setResendSuccess(false);

    try {
      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
      const payload = isLoginMode
        ? { email: email.trim(), password }
        : {
            username: username.trim(),
            email: email.trim(),
            password,
          };

      const data = await mobileApiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.token) {
        await setAuthToken(data.token);
      }

      setFailedAttempts(0);

      if (data.user) {
        onLoginSuccess(data.user);
      } else {
        // If registration completed, switch to login
        setIsLoginMode(true);
        setGeneralError("Account created successfully! Please sign in.");
      }
    } catch (err: unknown) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (isLoginMode && newAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutSecondsLeft(900);
        setGeneralError(null);
      } else {
        const message = err instanceof Error ? err.message : "";
        if (
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("password") ||
          message.toLowerCase().includes("credentials") ||
          message.toLowerCase().includes("unauthorized")
        ) {
          // Tell 4: Never reveal which field is wrong
          setGeneralError("Email or password is incorrect");
        } else if (
          message.toLowerCase().includes("already exists") ||
          message.toLowerCase().includes("duplicate") ||
          message.toLowerCase().includes("conflict")
        ) {
          setGeneralError("An account with this email or username already exists. Try signing in.");
        } else if (
          message.toLowerCase().includes("unverified") ||
          message.toLowerCase().includes("verify")
        ) {
          setIsUnverified(true);
        } else if (
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("failed to fetch") ||
          message.toLowerCase().includes("connect")
        ) {
          setGeneralError("Unable to connect to TaskFlow servers. Check your internet connection.");
        } else {
          setGeneralError(message || "Email or password is incorrect");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 5000);
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Grounded Top-Left Header with Compact ~24px Logo - Fix 1 & 5 */}
          <View style={styles.headerBar}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Icon name="checkmark-outline" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>TaskFlow</Text>
            </View>
          </View>

          {/* Value-Driven Header Copy (No generic "Welcome back") - Fix 3 */}
          <View style={styles.copyBlock}>
            <Text style={styles.headline}>
              {isLoginMode
                ? "Sign in to TaskFlow"
                : "Create your TaskFlow account"}
            </Text>
            <Text style={styles.subheadline}>
              {isLoginMode
                ? "Access your team's shared boards, active sprints, and task deadlines."
                : "Start organizing sprints, collaborating with your team, and tracking deliverables."}
            </Text>
          </View>

          {/* SPECIFIC ERROR STATES - Fix 4 */}

          {/* 1. Account Locked Out State */}
          {isLockedOut && (
            <View style={styles.lockoutBox}>
              <View style={styles.alertRow}>
                <Text style={styles.lockoutIcon}>🔒</Text>
                <View style={styles.alertTextWrap}>
                  <Text style={styles.lockoutTitle}>Account Temporarily Locked</Text>
                  <Text style={styles.lockoutDesc}>
                    Too many failed attempts. For security, wait{" "}
                    <Text style={{ fontWeight: "700" }}>{formatLockoutTime(lockoutSecondsLeft)}</Text>{" "}
                    before trying again or reset your password.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 2. Unverified Email Banner */}
          {isUnverified && (
            <View style={styles.unverifiedBox}>
              <Text style={styles.unverifiedTitle}>Email Unverified</Text>
              <Text style={styles.unverifiedDesc}>
                Your email is pending verification. Please verify your address via the confirmation link.
              </Text>
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendVerification}
              >
                <Text style={styles.resendBtnText}>Resend verification email</Text>
              </TouchableOpacity>
              {resendSuccess && (
                <Text style={styles.resendSuccessText}>✓ Verification email resent!</Text>
              )}
            </View>
          )}

          {/* 3. Credential or General Error Banner */}
          {generalError && !isLockedOut && (
            <View style={styles.generalErrorBox}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          )}


          {/* The Form (Visual Hero of the Screen) - Fix 5 */}
          <View style={styles.formContainer}>
            {/* Username Input (Registration Only) with field-level error - Fix 4 */}
            {!isLoginMode && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                  style={[
                    styles.input,
                    usernameError ? styles.inputErrorBorder : null,
                  ]}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (usernameError) setUsernameError(null);
                  }}
                  placeholder="alex_dev"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {usernameError && (
                  <Text style={styles.fieldErrorText}>⚠ {usernameError}</Text>
                )}
              </View>
            )}

            {/* Email Input with field-level error - Fix 4 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailError ? styles.inputErrorBorder : null,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@company.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !isLockedOut}
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>⚠ {emailError}</Text>
              )}
            </View>

            {/* Password Input with show/hide toggle & field-level error - Fix 4 */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                {isLoginMode && (
                  <TouchableOpacity
                    onPress={() =>
                      setGeneralError(
                        "To reset your password, contact your team workspace admin or check your registered email."
                      )
                    }
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    passwordError ? styles.inputErrorBorder : null,
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  editable={!loading && !isLockedOut}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeBtnText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={styles.fieldErrorText}>⚠ {passwordError}</Text>
              )}
            </View>

            {/* Submit Action Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (loading || isLockedOut) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || isLockedOut}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLoginMode ? "Sign in to TaskFlow" : "Create free account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Mode Switch Toggle (Sign in / Sign up) */}
            <TouchableOpacity
              onPress={() => {
                setIsLoginMode(!isLoginMode);
                setGeneralError(null);
                setUsernameError(null);
                setEmailError(null);
                setPasswordError(null);
              }}
              style={styles.toggleRow}
            >
              <Text style={styles.toggleText}>
                {isLoginMode ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <Text style={styles.toggleHighlight}>Sign Up</Text>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Text style={styles.toggleHighlight}>Sign In</Text>
                  </>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Grounded layout: pure solid surface, no floating card or gradient blob - Fix 1
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },

  // Compact top-left header logo (~24px) - Fix 5
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },

  // Outcome-focused header copy (No generic "Welcome back") - Fix 3
  copyBlock: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 6,
    lineHeight: 20,
  },

  // Real, specific error states - Fix 4
  generalErrorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  lockoutBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  lockoutIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  alertTextWrap: {
    flex: 1,
  },
  lockoutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
  },
  lockoutDesc: {
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 3,
    lineHeight: 17,
  },

  unverifiedBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  unverifiedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
  },
  unverifiedDesc: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 17,
  },
  resendBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resendBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resendSuccessText: {
    marginTop: 6,
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },


  // The Form
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  passwordInputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  eyeBtnText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
    marginTop: 2,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Mode Switch
  toggleRow: {
    marginTop: 14,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    color: "#6B7280",
  },
  toggleHighlight: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
