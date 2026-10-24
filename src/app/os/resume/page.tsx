import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Resume } from "@/components/os/modules/Resume";

export const metadata = { title: "Resume — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Resume />
      </Gate>
    </Suspense>
  );
}
