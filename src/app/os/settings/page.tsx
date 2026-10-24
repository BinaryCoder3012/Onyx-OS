import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Settings } from "@/components/os/modules/Settings";

export const metadata = { title: "Settings — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Settings />
      </Gate>
    </Suspense>
  );
}
