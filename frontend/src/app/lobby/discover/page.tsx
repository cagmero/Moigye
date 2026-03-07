"use client";
import { useRouter } from "next/navigation";
import DiscoveryExplorer from "@/components/DiscoveryExplorer";

export default function DiscoverPage() {
    const router = useRouter();
    return <DiscoveryExplorer onBack={() => router.push("/lobby")} />;
}
