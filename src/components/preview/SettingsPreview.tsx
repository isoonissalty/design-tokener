"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Bell, CheckCircle2, Info, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialProfile = {
  name: "Jordan Lee",
  email: "jordan@example.com",
  role: "Product designer",
  updates: true,
  newsletter: false,
  digest: "weekly",
};

type ProfileErrors = Partial<Record<"name" | "email", string>>;

export function SettingsPreview() {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [status, setStatus] = useState("");

  function updateProfile<K extends keyof typeof initialProfile>(key: K, value: typeof initialProfile[K]) {
    setProfile(current => ({ ...current, [key]: value }));
    if (key === "name" || key === "email") {
      setErrors(current => ({ ...current, [key]: undefined }));
    }
    setStatus("");
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ProfileErrors = {};
    if (!profile.name.trim()) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) {
      setStatus("");
      (nextErrors.name ? nameRef : emailRef).current?.focus();
      return;
    }
    const nextProfile = { ...profile, name: profile.name.trim(), email: profile.email.trim() };
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
    setStatus("Your changes have been saved in this preview.");
  }

  function cancelChanges() {
    setProfile(savedProfile);
    setErrors({});
    setStatus("Changes discarded. Your last saved preferences have been restored.");
  }

  return (
    <div className="preview-page mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">Your workspace</span>
        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="max-w-2xl text-muted-foreground">Make yourself at home. Manage your profile and choose how you stay in the loop.</p>
      </div>

      <form noValidate onSubmit={saveProfile} className="space-y-6">
        <div className="preview-grid-two grid gap-6">
          <Card className="min-w-0">
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRound aria-hidden="true" className="h-5 w-5" /></div>
              <CardTitle><h2>Personal profile</h2></CardTitle>
              <CardDescription>A little information about the person behind the work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-name`}>Full name <span aria-hidden="true">*</span></Label>
                <Input ref={nameRef} id={`${id}-name`} name="name" autoComplete="name" required value={profile.name} onChange={event => updateProfile("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p id={`${id}-name-error`} role="alert" className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`}>Email address <span aria-hidden="true">*</span></Label>
                <Input ref={emailRef} id={`${id}-email`} name="email" type="email" autoComplete="email" required value={profile.email} onChange={event => updateProfile("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : `${id}-email-help`} className={errors.email ? "border-destructive" : ""} />
                {errors.email ? <p id={`${id}-email-error`} role="alert" className="text-sm text-destructive">{errors.email}</p> : <p id={`${id}-email-help`} className="text-xs text-muted-foreground">Used for account updates and workspace invitations.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-role`}>Job title</Label>
                <Input id={`${id}-role`} name="role" value={profile.role} onChange={event => updateProfile("role", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-workspace`}>Workspace ID</Label>
                <Input id={`${id}-workspace`} value="workspace_2048" disabled aria-describedby={`${id}-workspace-help`} />
                <p id={`${id}-workspace-help`} className="text-xs text-muted-foreground">Managed by your workspace administrator.</p>
              </div>
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bell aria-hidden="true" className="h-5 w-5" /></div>
                <CardTitle><h2>Notifications</h2></CardTitle>
                <CardDescription>Keep the updates that matter to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1"><Label htmlFor={`${id}-updates`}>Project updates</Label><p id={`${id}-updates-help`} className="text-xs text-muted-foreground">Activity, comments, and milestones from your team.</p></div>
                  <input id={`${id}-updates`} type="checkbox" checked={profile.updates} onChange={event => updateProfile("updates", event.target.checked)} aria-describedby={`${id}-updates-help`} className="mt-1 h-4 w-4 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" style={{ accentColor: "var(--primary)" }} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1"><Label htmlFor={`${id}-newsletter`}>The monthly edit</Label><p id={`${id}-newsletter-help`} className="text-xs text-muted-foreground">Fresh ideas, product news, and useful resources.</p></div>
                  <input id={`${id}-newsletter`} type="checkbox" checked={profile.newsletter} onChange={event => updateProfile("newsletter", event.target.checked)} aria-describedby={`${id}-newsletter-help`} className="mt-1 h-4 w-4 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" style={{ accentColor: "var(--primary)" }} />
                </div>
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor={`${id}-digest`}>Activity digest</Label>
                  <select id={`${id}-digest`} value={profile.digest} onChange={event => updateProfile("digest", event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="daily">Every day</option>
                    <option value="weekly">Once a week</option>
                    <option value="off">Turned off</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-3 pt-6">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-intent-success)" }} />
                <div className="space-y-1"><h3 className="font-medium">Your account is protected</h3><p className="text-sm text-muted-foreground">Two-step verification is enabled for this workspace.</p></div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
          <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-intent-warning)" }} />
          <p className="text-sm text-muted-foreground">This is a sample account. Changes stay in this preview and reset when you switch examples or open full screen.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <div role="status" className="flex min-h-6 flex-1 items-start gap-2 text-sm">
            {status && <><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-intent-success)" }} /><span>{status}</span></>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={cancelChanges}>Cancel changes</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
