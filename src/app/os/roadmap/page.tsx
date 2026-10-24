import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Roadmap } from "@/components/os/modules/Roadmap";

export const metadata = { title: "Roadmap — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Roadmap />
      </Gate>
    </Suspense>
  );
}
