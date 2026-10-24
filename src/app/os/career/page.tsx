import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Career } from "@/components/os/modules/Career";

export const metadata = { title: "Career — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Career />
      </Gate>
    </Suspense>
  );
}
