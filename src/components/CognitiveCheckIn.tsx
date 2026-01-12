import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Brain, ArrowRight, Check, X, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface AssessmentResult {
  assessment_type: string;
  score: number;
  max_score: number;
  time_taken_seconds: number;
  responses: {
    words_shown: string[];
    words_recalled: string[];
    pattern_shown: number[];
    pattern_answer: string;
    pattern_correct: boolean;
  };
}

const WORD_LISTS = [
  ["apple", "table", "penny"],
  ["banana", "chair", "nickel"],
  ["orange", "desk", "quarter"],
  ["mango", "bench", "rupee"],
  ["grape", "stool", "dollar"],
];

const PATTERN_SEQUENCES = [
  [2, 4, 6, 8],
  [3, 6, 9, 12],
  [5, 10, 15, 20],
  [1, 3, 5, 7],
  [4, 8, 12, 16],
];

type AssessmentStage = "intro" | "word_memorize" | "word_distraction" | "word_recall" | "pattern" | "complete";

export const CognitiveCheckIn = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<AssessmentStage>("intro");
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [patternAnswer, setPatternAnswer] = useState("");
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [countdown, setCountdown] = useState(10);
  
  const { data: lastAssessment } = useQuery({
    queryKey: ["last-cognitive-assessment"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("cognitive_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("assessment_date", { ascending: false })
        .limit(1)
        .single();

      return data;
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (result: AssessmentResult) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const insertData = {
        user_id: user.id,
        assessment_date: new Date().toISOString().split("T")[0],
        assessment_type: result.assessment_type,
        score: result.score,
        max_score: result.max_score,
        time_taken_seconds: result.time_taken_seconds,
        responses: result.responses as unknown as Record<string, unknown>,
        risk_level: getRiskLevel(result.score, result.max_score),
      };

      const { data, error } = await supabase
        .from("cognitive_assessments")
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cognitive-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["last-cognitive-assessment"] });
    },
  });

  const getRiskLevel = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "normal";
    if (percentage >= 60) return "mild_concern";
    if (percentage >= 40) return "moderate_concern";
    return "recommend_evaluation";
  };

  const startAssessment = () => {
    // Pick random words and pattern
    const randomWords = WORD_LISTS[Math.floor(Math.random() * WORD_LISTS.length)];
    const randomPattern = PATTERN_SEQUENCES[Math.floor(Math.random() * PATTERN_SEQUENCES.length)];
    
    setCurrentWords(randomWords);
    setCurrentPattern(randomPattern);
    setRecalledWords([]);
    setScore(0);
    setMaxScore(6); // 3 words (1 point each) + pattern (1 point) + time bonus (2 points)
    setStartTime(Date.now());
    setStage("word_memorize");
    setCountdown(10);
  };

  // Countdown timer for memorization
  useEffect(() => {
    if (stage === "word_memorize" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === "word_memorize" && countdown === 0) {
      setStage("word_distraction");
      setCountdown(15);
    } else if (stage === "word_distraction" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === "word_distraction" && countdown === 0) {
      setStage("word_recall");
    }
  }, [stage, countdown]);

  const addRecalledWord = useCallback(() => {
    if (currentInput.trim()) {
      const word = currentInput.trim().toLowerCase();
      if (!recalledWords.includes(word)) {
        setRecalledWords([...recalledWords, word]);
      }
      setCurrentInput("");
    }
  }, [currentInput, recalledWords]);

  const checkWordRecall = () => {
    const correctWords = recalledWords.filter(word => 
      currentWords.map(w => w.toLowerCase()).includes(word.toLowerCase())
    );
    const wordScore = correctWords.length;
    setScore(prev => prev + wordScore);
    setStage("pattern");
  };

  const checkPattern = () => {
    const expectedNext = currentPattern[currentPattern.length - 1] + (currentPattern[1] - currentPattern[0]);
    const isCorrect = parseInt(patternAnswer) === expectedNext;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Calculate time bonus
    const totalTime = (Date.now() - startTime) / 1000;
    const timeBonus = totalTime < 45 ? 2 : totalTime < 60 ? 1 : 0;
    setScore(prev => prev + timeBonus);

    // Save and complete
    saveAssessment.mutate({
      assessment_type: "mini_cog",
      score: score + (isCorrect ? 1 : 0) + timeBonus,
      max_score: maxScore,
      time_taken_seconds: Math.round(totalTime),
      responses: {
        words_shown: currentWords,
        words_recalled: recalledWords,
        pattern_shown: currentPattern,
        pattern_answer: patternAnswer,
        pattern_correct: isCorrect,
      },
    });

    setStage("complete");
    haptic("success");
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setStage("intro");
    setCurrentInput("");
    setPatternAnswer("");
    setRecalledWords([]);
  };

  const daysSinceLastAssessment = lastAssessment
    ? Math.floor((Date.now() - new Date(lastAssessment.assessment_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const shouldShowReminder = daysSinceLastAssessment === null || daysSinceLastAssessment >= 7;

  return (
    <>
      <Card 
        className={`border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/30 ${
          shouldShowReminder ? "ring-1 ring-primary/20" : ""
        }`}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-500" />
            Brain Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastAssessment ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last check</span>
                <span className="text-sm">{daysSinceLastAssessment} days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="text-sm font-medium">
                  {lastAssessment.score}/{lastAssessment.max_score}
                </span>
              </div>
              {shouldShowReminder && (
                <p className="text-xs text-primary mt-2">Weekly check recommended</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Take a quick brain health check
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={closeAndReset}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Brain Health Check
            </DialogTitle>
          </DialogHeader>

          {stage === "intro" && (
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                This quick 2-minute check helps track your cognitive health over time. 
                It includes:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">1</div>
                  Memorize 3 words
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">2</div>
                  A brief distraction task
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">3</div>
                  Recall the words
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">4</div>
                  Complete a number pattern
                </li>
              </ul>
              <Button className="w-full gap-2" onClick={startAssessment}>
                Start Check
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {stage === "word_memorize" && (
            <div className="space-y-6 py-4 text-center">
              <p className="text-muted-foreground">Memorize these 3 words:</p>
              <div className="space-y-3">
                {currentWords.map((word, idx) => (
                  <div 
                    key={idx} 
                    className="text-3xl font-bold text-primary animate-fade-in"
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  >
                    {word}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{countdown} seconds remaining</span>
              </div>
            </div>
          )}

          {stage === "word_distraction" && (
            <div className="space-y-6 py-4 text-center">
              <p className="text-lg font-medium">Count backwards from 100 by 7s</p>
              <p className="text-4xl font-mono text-muted-foreground">
                100, 93, 86, 79...
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{countdown} seconds</span>
              </div>
            </div>
          )}

          {stage === "word_recall" && (
            <div className="space-y-4 py-4">
              <p className="text-center text-muted-foreground">
                What were the 3 words?
              </p>
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type a word"
                  onKeyPress={(e) => e.key === "Enter" && addRecalledWord()}
                  autoFocus
                />
                <Button onClick={addRecalledWord}>Add</Button>
              </div>
              
              {recalledWords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recalledWords.map((word, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={checkWordRecall}
                disabled={recalledWords.length === 0}
              >
                Continue
              </Button>
            </div>
          )}

          {stage === "pattern" && (
            <div className="space-y-6 py-4">
              <p className="text-center text-muted-foreground">
                What number comes next?
              </p>
              <div className="flex items-center justify-center gap-3 text-2xl font-mono">
                {currentPattern.map((num, idx) => (
                  <span key={idx}>{num}</span>
                ))}
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">?</span>
              </div>
              <Input
                type="number"
                value={patternAnswer}
                onChange={(e) => setPatternAnswer(e.target.value)}
                placeholder="Your answer"
                className="text-center text-xl"
                autoFocus
              />
              <Button 
                className="w-full"
                onClick={checkPattern}
                disabled={!patternAnswer}
              >
                Submit
              </Button>
            </div>
          )}

          {stage === "complete" && (
            <div className="space-y-6 py-4 text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto" />
              <div>
                <p className="text-2xl font-bold">{score}/{maxScore}</p>
                <p className="text-muted-foreground">Brain Health Score</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Words recalled:</span>
                  <span>{recalledWords.filter(w => 
                    currentWords.map(cw => cw.toLowerCase()).includes(w.toLowerCase())
                  ).length}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Pattern correct:</span>
                  <span>{patternAnswer === String(currentPattern[currentPattern.length - 1] + (currentPattern[1] - currentPattern[0])) ? "Yes" : "No"}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Regular checks help track changes over time. 
                This is not a medical diagnosis.
              </p>

              <Button className="w-full" onClick={closeAndReset}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
