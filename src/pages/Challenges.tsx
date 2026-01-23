import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Share2, CheckCircle2, Target, Flame, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Challenges = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myMemberships } = useQuery({
    queryKey: ["challenge-memberships", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("challenge_members")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("challenge_members").insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-memberships"] });
      toast.success(language === "hi" ? "चुनौती में शामिल हो गए!" : "Joined challenge!");
    },
    onError: () => {
      toast.error(language === "hi" ? "शामिल होने में त्रुटि" : "Failed to join");
    },
  });

  const leaveChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("challenge_members")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-memberships"] });
      toast.success(language === "hi" ? "चुनौती छोड़ी" : "Left challenge");
    },
  });

  const isJoined = (challengeId: string) => 
    myMemberships?.some(m => m.challenge_id === challengeId);

  const getMembership = (challengeId: string) =>
    myMemberships?.find(m => m.challenge_id === challengeId);

  const getChallengeIcon = (title: string) => {
    if (title.toLowerCase().includes("120")) return Target;
    if (title.toLowerCase().includes("bp") || title.toLowerCase().includes("pressure")) return Heart;
    if (title.toLowerCase().includes("walk") || title.toLowerCase().includes("step")) return Flame;
    return Trophy;
  };

  const shareChallenge = async (challenge: any) => {
    const text = language === "hi" 
      ? `मैं Beat पर "${challenge.title}" चुनौती में भाग ले रहा हूं! आओ साथ में स्वस्थ रहें 💪`
      : `I'm participating in "${challenge.title}" challenge on Beat! Join me in staying healthy 💪`;
    
    if (navigator.share) {
      await navigator.share({ title: challenge.title, text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success(language === "hi" ? "कॉपी हो गया!" : "Copied to clipboard!");
    }
  };

  // Get featured challenges from database (first 3 active challenges)
  const featuredChallenges = (challenges || []).slice(0, 3).map((challenge, index) => {
    const colors = [
      "from-rose-500 to-pink-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-amber-600",
    ];
    const Icon = getChallengeIcon(challenge.title);
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      id: challenge.id,
      title: challenge.title,
      titleHi: challenge.title, // Could add Hindi titles to DB
      description: challenge.description || "",
      descriptionHi: challenge.description || "",
      participants: Math.floor(Math.random() * 2000) + 500, // Mock for now
      daysLeft,
      reward: challenge.reward_points || 50,
      icon: Icon,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-gradient-primary">
            {language === "hi" ? "स्वास्थ्य चुनौतियां" : "Health Challenges"}
          </h1>
          <p className="text-muted-foreground">
            {language === "hi" 
              ? "समुदाय के साथ मिलकर स्वस्थ आदतें बनाएं" 
              : "Build healthy habits together with the community"}
          </p>
        </div>

        {/* Featured Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {language === "hi" ? "लोकप्रिय चुनौतियां" : "Featured Challenges"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredChallenges.map((challenge, index) => (
              <Card 
                key={challenge.id} 
                className="overflow-hidden group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-2 bg-gradient-to-r ${challenge.color}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-white`}>
                      <challenge.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {challenge.daysLeft} {language === "hi" ? "दिन बाकी" : "days left"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-1">
                    {language === "hi" ? challenge.titleHi : challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "hi" ? challenge.descriptionHi : challenge.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.participants.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      {challenge.reward} pts
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      variant={isJoined(challenge.id) ? "outline" : "default"}
                      onClick={() => isJoined(challenge.id) 
                        ? leaveChallenge.mutate(challenge.id) 
                        : joinChallenge.mutate(challenge.id)
                      }
                      disabled={joinChallenge.isPending || leaveChallenge.isPending}
                    >
                      {isJoined(challenge.id) 
                        ? (language === "hi" ? "शामिल ✓" : "Joined ✓") 
                        : (language === "hi" ? "शामिल हों" : "Join")}
                    </Button>
                    <Button
                      variant="outline" 
                      size="icon" 
                      className="shrink-0"
                      onClick={() => shareChallenge(challenge)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* My Active Challenges */}
        {myMemberships && myMemberships.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {language === "hi" ? "मेरी चुनौतियां" : "My Challenges"}
            </h2>
            <div className="space-y-4">
              {myMemberships.map((membership) => {
                const challenge = challenges?.find(c => c.id === membership.challenge_id);
                if (!challenge) return null;
                const Icon = getChallengeIcon(challenge.title);
                
                return (
                  <Card key={membership.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={membership.progress || 0} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{membership.progress || 0}%</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => leaveChallenge.mutate(challenge.id)}
                      >
                        {language === "hi" ? "छोड़ें" : "Leave"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Challenges from DB */}
        {challenges && challenges.length > 0 && (
          <div>
            <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {language === "hi" ? "सभी चुनौतियां" : "All Challenges"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((challenge) => {
                const joined = isJoined(challenge.id);
                const Icon = getChallengeIcon(challenge.title);
                
                return (
                  <Card key={challenge.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {joined ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => leaveChallenge.mutate(challenge.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                              {language === "hi" ? "शामिल" : "Joined"}
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => joinChallenge.mutate(challenge.id)}
                              disabled={joinChallenge.isPending}
                            >
                              {language === "hi" ? "शामिल हों" : "Join"}
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => shareChallenge(challenge)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {challengesLoading && (
          <div className="text-center py-12 text-muted-foreground">
            {language === "hi" ? "लोड हो रहा है..." : "Loading challenges..."}
          </div>
        )}
      </main>
    </div>
  );
};

export default Challenges;
