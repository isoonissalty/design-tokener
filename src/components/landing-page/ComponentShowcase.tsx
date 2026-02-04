"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ComponentShowcase() {
  const [tab, setTab] = useState("general");

  return (
    <section className="py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Component Library
          </h2>
          <p className="text-muted-foreground text-lg">
            Styled with your custom tokens
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           {/* Card & Input Demo */}
           <Card>
             <CardHeader>
               <CardTitle>Authentication</CardTitle>
               <CardDescription>Login to your account</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" placeholder="m@example.com" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <Input id="password" type="password" />
               </div>
             </CardContent>
             <CardFooter>
               <Button className="w-full">Sign In</Button>
             </CardFooter>
           </Card>

           {/* Tabs & Slider Demo */}
           <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="space-y-4">
                     <div className="space-y-2">
                       <Label>Volume</Label>
                       <Slider defaultValue={[50]} max={100} step={1} />
                     </div>
                     <div className="space-y-2">
                       <Label>Brightness</Label>
                       <Slider defaultValue={[75]} max={100} step={1} />
                     </div>
                  </TabsContent>
                  <TabsContent value="notifications">
                    <p className="text-sm text-muted-foreground">
                      Configure how you receive alerts.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                 <Button variant="outline">Save Changes</Button>
              </CardFooter>
           </Card>
        </div>
      </div>
    </section>
  );
}
