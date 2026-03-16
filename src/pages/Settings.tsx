import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, Lock, LogOut, Save, Loader2, Sun, Moon, Palette, Bell, BellOff, Send } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useNotifications } from "@/hooks/useNotifications";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { permission, isSubscribed, loading: notifLoading, subscribe, unsubscribe, sendTestNotification, supported: pushSupported } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("id", user!.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("id", user!.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
      trackEvent("profile_updated");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user!.id);

    if (!updateErr) {
      setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
      toast.success("Avatar updated");
      trackEvent("avatar_updated");
    }
    setUploading(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const initials = displayName
    ? displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-wide text-gold-blue-shimmer mb-1">
            Settings
          </h1>
          <p className="text-muted-foreground mb-8">Manage your profile and account</p>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-secondary/50 border border-border mb-8">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Lock className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* ─── APPEARANCE TAB ─── */}
            <TabsContent value="appearance">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                    <div>
                      <p className="text-foreground font-medium">Theme</p>
                      <p className="text-muted-foreground text-sm">
                        {theme === "dark" ? "Dark mode" : "Light mode"} is active
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "light"}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle theme"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="profile">
              <div className="space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-primary/30">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-display">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <Camera className="w-5 h-5 text-primary" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadAvatar}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{displayName || "Set your name"}</p>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="bg-secondary/50 border-border"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-secondary/50 border-border min-h-[100px] resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={saving || loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            {/* ─── ACCOUNT TAB ─── */}
            <TabsContent value="account">
              <div className="space-y-8">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-secondary/30 border-border text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Your sign-in email cannot be changed here.</p>
                </div>

                <Separator className="bg-border/50" />

                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-foreground font-medium">Change Password</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={changePassword}
                    disabled={changingPassword || !newPassword}
                    variant="outline"
                    className="border-border"
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    Update Password
                  </Button>
                </div>

                <Separator className="bg-border/50" />

                {/* Sign Out */}
                <div className="space-y-3">
                  <h3 className="text-foreground font-medium">Session</h3>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Settings;
