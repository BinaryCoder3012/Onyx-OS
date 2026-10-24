import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Today } from "@/components/os/modules/Today";

export const metadata = { title: "Today — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Today />
      </Gate>
    </Suspense>
  );
}
