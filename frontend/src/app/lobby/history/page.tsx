"use client";
import { useRouter } from "next/navigation";
import UserProfilePanel from "@/components/UserProfilePanel";

export default function HistoryPage() {
    const router = useRouter();
    return <UserProfilePanel onBack={() => router.push("/lobby")} />;
}
