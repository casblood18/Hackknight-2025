import type { Route } from "./+types/results";
import { useLocation } from "react-router";
import ResultsSidebar from "../components/ResultsSidebar";
import ResultsContent from "../components/ResultsContent";
import type { Message } from "../hooks/useSpeechAI";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Training Complete - Small Talk Trainer" },
    {
      name: "description",
      content: "Your conversation training session is complete",
    },
  ];
}

interface LocationState {
  messages?: Message[];
  sessionId?: string;
}

export default function Results() {
  const location = useLocation();
  const state = location.state as LocationState;
  const messages = state?.messages || [];

  return (
    <div className="flex min-h-screen">
      <ResultsSidebar messages={messages} />
      <ResultsContent />
    </div>
  );
}
