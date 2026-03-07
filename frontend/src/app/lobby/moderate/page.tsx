"use client";
import { useRouter } from "next/navigation";
import ModeratorPanel from "@/components/ModeratorPanel";

export default function ModeratePage() {
    const router = useRouter();
    return <ModeratorPanel onBack={() => router.push("/lobby")} />;
}
