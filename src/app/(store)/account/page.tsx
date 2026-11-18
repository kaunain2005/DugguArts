"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, linkPasswordCredential, signOut, refreshSession } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password linking state (for Google users)
  const [newLinkPassword, setNewLinkPassword] = useState("");
  const [isLinkingPassword, setIsLinkingPassword] = useState(false);

  // Password change state (for existing password users)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?callbackUrl=/account");
    } else if (user) {
      setDisplayName(user.name || "");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasPasswordProvider = user.providers.includes("password");
  const hasGoogleProvider =
    user.providers.includes("google.com") || user.providers.includes("google");

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update profile");
      }
      showToast("success", "Profile updated successfully");
      await refreshSession();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkPassword || newLinkPassword.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }

    setIsLinkingPassword(true);
    try {
      await linkPasswordCredential(newLinkPassword);
      showToast("success", "Password successfully linked to your Google account!");
      setNewLinkPassword("");
      await refreshSession();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to link password credential");
    } finally {
      setIsLinkingPassword(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to change password");
      }
      showToast("success", "Password updated successfully. Please log in again.");
      await signOut();
      router.replace("/login");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container py-12 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text">Account Settings</h1>
        <p className="text-text-muted mt-1">Manage your profile, authentication methods and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-2xl">
                {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-text">{user.name || "Customer"}</h2>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant={user.isAdmin ? "primary" : "secondary"}>
                  {user.role === "admin" ? "Admin" : "Customer"}
                </Badge>
                {user.emailVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Verified
                  </Badge>
                )}
              </div>
              <hr className="border-border" />
              <div className="text-left text-xs text-text-muted space-y-2">
                <p>
                  <strong>UID:</strong> <span className="font-mono">{user.uid}</span>
                </p>
                <p>
                  <strong>Linked Sign-ins:</strong> {user.providers.join(", ")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:bg-red-500/10"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Name Edit */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg text-text flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
                <Input label="Email Address" value={user.email} disabled />
                <Button type="submit" loading={isUpdatingProfile} disabled={isUpdatingProfile}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Linking: Google users adding a password */}
          {hasGoogleProvider && !hasPasswordProvider && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading font-semibold text-lg text-text flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Set a Password for Your Account
                </h3>
                <p className="text-sm text-text-muted">
                  You are currently signed in with Google. You can link a password credential to your existing
                  account so you can log in with either Google or email and password without creating a duplicate account.
                </p>
                <form onSubmit={handleLinkPassword} className="space-y-4">
                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="••••••••"
                    value={newLinkPassword}
                    onChange={(e) => setNewLinkPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={isLinkingPassword} disabled={isLinkingPassword}>
                    Link Password to Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Password Change for users with existing password */}
          {hasPasswordProvider && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading font-semibold text-lg text-text flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={isChangingPassword} disabled={isChangingPassword}>
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
