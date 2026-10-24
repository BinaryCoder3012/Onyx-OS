import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Openings } from "@/components/os/modules/Openings";

export const metadata = { title: "Openings — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Openings />
      </Gate>
    </Suspense>
  );
}
