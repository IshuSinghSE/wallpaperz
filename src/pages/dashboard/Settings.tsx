
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [appSettings, setAppSettings] = useState({
    siteTitle: "Wallpaper Admin",
    logoDark: "/logo-dark.png",
    logoLight: "/logo-light.png",
    maxUploadSize: 5, // MB
    allowNewRegistrations: true,
    approveWallpapersAutomatically: false,
    enableAIDetection: true,
    notifyOnNewUploads: true,
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    notifyNewUsers: true,
    notifyNewWallpapers: true,
    notifyNewComments: true,
    emailNotifications: true,
    pushNotifications: false,
    digestFrequency: "daily",
  });

  const handleSaveAppSettings = () => {
    // In a real application, this would be saved to Firebase or your backend
    toast({
      title: "Settings Saved",
      description: "Application settings have been updated successfully",
    });
  };

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated",
    });
  };

  const handleResetSettings = () => {
    // Show confirmation dialog in real application
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Manage application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">General Settings</CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                Configure basic application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={appSettings.siteTitle}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      siteTitle: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">Maximum Upload Size (MB)</Label>
                <Input
                  id="maxUploadSize"
                  type="number"
                  value={appSettings.maxUploadSize}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      maxUploadSize: Number(e.target.value),
                    })
                  }
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.allowNewRegistrations}
                    onCheckedChange={(checked) =>
                      setAppSettings({
                        ...appSettings,
                        allowNewRegistrations: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Approve Wallpapers</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve new wallpaper uploads
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.approveWallpapersAutomatically}
                    onCheckedChange={(checked) =>
                      setAppSettings({
                        ...appSettings,
                        approveWallpapersAutomatically: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Detect AI-generated wallpapers automatically
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.enableAIDetection}
                    onCheckedChange={(checked) =>
                      setAppSettings({
                        ...appSettings,
                        enableAIDetection: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the site in maintenance mode (only admins can access)
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setAppSettings({
                        ...appSettings,
                        maintenanceMode: checked,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveAppSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Notification Settings</CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New User Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when new users register
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyNewUsers}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        notifyNewUsers: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Wallpaper Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new wallpaper uploads
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyNewWallpapers}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        notifyNewWallpapers: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Comment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when users comment on wallpapers
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyNewComments}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        notifyNewComments: checked,
                      })
                    }
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings} className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">API Settings</CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                Manage API keys and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value="api_1234567890abcdefghijklmn"
                    readOnly
                  />
                  <Button variant="outline">Show</Button>
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>API Access</Label>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key provides full access to your account. Keep it secure.
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://example.com/webhook"
                  value=""
                />
                <p className="text-sm text-muted-foreground">
                  Receive real-time updates via webhook
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save API Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Appearance Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logoDark">Dark Logo URL</Label>
                <Input
                  id="logoDark"
                  value={appSettings.logoDark}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      logoDark: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoLight">Light Logo URL</Label>
                <Input
                  id="logoLight"
                  value={appSettings.logoLight}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      logoLight: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Theme Preferences</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start h-auto py-4 px-4">
                    <div className="space-y-1 text-left">
                      <p className="font-medium">Light</p>
                      <p className="text-xs text-muted-foreground">
                        Light background with dark text
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-4 px-4">
                    <div className="space-y-1 text-left">
                      <p className="font-medium">Dark</p>
                      <p className="text-xs text-muted-foreground">
                        Dark background with light text
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-4 px-4 border-primary">
                    <div className="space-y-1 text-left">
                      <p className="font-medium">System</p>
                      <p className="text-xs text-muted-foreground">
                        Follow system preference
                      </p>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
