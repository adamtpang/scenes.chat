import type { Metadata } from "next";
import { passcodeRequired } from "@/lib/proto/auth";
import { transcriptionConfigured } from "@/lib/proto/transcribe";
import { fetchTurns } from "./actions";
import Cohort from "./cohort";
import "./proto.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scenes: proto cohort",
  robots: { index: false, follow: false },
};

export default async function ProtoPage() {
  const turns = await fetchTurns();
  return (
    <Cohort
      initialTurns={turns}
      transcription={transcriptionConfigured()}
      needsPass={passcodeRequired()}
    />
  );
}
