import { CheckIn } from "@/components/CheckIn";
import { ClientOnly } from "@/components/ClientOnly";

export default function Page() {
  return (
    <ClientOnly>
      <CheckIn />
    </ClientOnly>
  );
}
