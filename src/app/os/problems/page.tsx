import { Suspense } from "react";
import { Gate } from "@/components/os/Gate";
import { Problems } from "@/components/os/modules/Problems";

export const metadata = { title: "Problems — Onyx OS" };

export default function Page() {
  return (
    <Suspense>
      <Gate>
        <Problems />
      </Gate>
    </Suspense>
  );
}
