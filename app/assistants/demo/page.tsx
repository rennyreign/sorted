import type { Metadata } from "next";
import DemoBoard from "./DemoBoard";

export const metadata: Metadata = {
  title: "Assistant demo — job status",
  description: "Internal view of assistant conversations, jobs and quote drafts.",
  robots: { index: false, follow: false },
};

export default function AssistantDemoPage() {
  return <DemoBoard />;
}
