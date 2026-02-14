"use client";

import Container from "@/components/ui/Container";
import { Header } from "./media-pulse/Header";
import { DashboardGrid } from "./media-pulse/DashboardGrid";
import { DetailedContent } from "./media-pulse/DetailedContent";
import { AnalyticsStrategy } from "./media-pulse/AnalyticsStrategy";

export default function MediaPulseClient() {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-background">
            <Container>
                <Header />
                <DashboardGrid />
                <div className="mt-32 space-y-32">
                    <DetailedContent />
                    <AnalyticsStrategy />
                </div>
            </Container>
        </main>
    );
}
