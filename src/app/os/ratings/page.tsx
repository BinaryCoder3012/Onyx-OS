import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Ratings } from "@/components/os/modules/Ratings";

export const metadata = { title: "Ratings — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Ratings />
      </Gate>
    </Suspense>
  );
}
