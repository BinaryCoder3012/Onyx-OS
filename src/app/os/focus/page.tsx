import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Focus } from "@/components/os/modules/Focus";

export const metadata = { title: "Focus — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Focus />
      </Gate>
    </Suspense>
  );
}
