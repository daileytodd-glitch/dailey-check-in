import type { Metadata } from "next";
import { Board } from "@/components/Board";
import { ClientOnly } from "@/components/ClientOnly";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: `${APP_NAME} · TV Board` };

export default function TvPage() {
  return (
    <ClientOnly>
      <Board />
    </ClientOnly>
  );
}
