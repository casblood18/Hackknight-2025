import type { Route } from "./+types/results";
import ResultsSidebar from "../components/ResultsSidebar";
import ResultsContent from "../components/ResultsContent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Training Complete - Small Talk Trainer" },
    {
      name: "description",
      content: "Your conversation training session is complete",
    },
  ];
}

export default function Results() {
  return (
    <div className="flex min-h-screen">
      <ResultsSidebar />
      <ResultsContent />
    </div>
  );
}
