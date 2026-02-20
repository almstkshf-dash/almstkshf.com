'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Loader2, Link2 } from 'lucide-react';
import Button from './ui/Button';

declare global {
    interface Window {
        PhylloConnect: any;
    }
}

interface PhylloConnectButtonProps {
    className?: string;
    label?: string;
}

export default function PhylloConnectButton({ className, label = "Connect Social Accounts" }: PhylloConnectButtonProps) {
    const getOrCreateUser = useAction(api.phyllo.getOrCreatePhylloUser);
    const getToken = useAction(api.phyllo.getPhylloToken);
    const [isConnecting, setIsConnecting] = useState(false);

    const openPhyllo = async () => {
        setIsConnecting(true);
        try {
            // 1. Get or Create Phyllo User (Steps 1 from Phyllo docs)
            console.log("🛠️ Initializing Phyllo User...");
            const phylloUserId = await getOrCreateUser();

            // 2. Get SDK Token
            console.log("🔑 Generating Phyllo SDK Token...");
            const token = await getToken({ phylloUserId });

            // 3. Initialize and Open SDK (Step 2 from Phyllo docs)
            if (window.PhylloConnect) {
                const config = {
                    clientDisplayName: "ALMSTKSHF MEDIA",
                    environment: "staging", // Using staging as per request
                    userId: phylloUserId,
                    token: token,
                };

                const phylloConnect = window.PhylloConnect.initialize(config);

                phylloConnect.on("accountConnected", (accountId: string, workplatformId: string, userId: string) => {
                    console.log(`✅ Phyllo: Account Connected: ${accountId}, ${workplatformId}, ${userId}`);
                });

                phylloConnect.on("accountDisconnected", (accountId: string, workplatformId: string, userId: string) => {
                    console.log(`❌ Phyllo: Account Disconnected: ${accountId}, ${workplatformId}, ${userId}`);
                });

                phylloConnect.on("exit", (reason: string, userId: string) => {
                    console.log(`🚪 Phyllo: SDK Closed (${reason})`);
                    setIsConnecting(false);
                });

                phylloConnect.on("connectionFailure", (reason: string, workplatformId: string, userId: string) => {
                    console.error(`⚠️ Phyllo: Connection Failure: ${reason}`);
                });

                phylloConnect.open();
            } else {
                throw new Error("Phyllo SDK not loaded yet.");
            }
        } catch (error: any) {
            console.error("Phyllo connection error:", error);
            alert(error.message || "Failed to initiate Phyllo. Please check your API settings.");
            setIsConnecting(false);
        }
    };

    return (
        <>
            <Script
                src="https://cdn.getphyllo.com/connect/v2/phyllo-connect.js"
                strategy="lazyOnload"
                onLoad={() => console.log("📚 Phyllo SDK Loaded")}
            />
            <Button
                type="button"
                variant="primary"
                onClick={openPhyllo}
                isLoading={isConnecting}
                className={className || "flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 h-auto"}
                leftIcon={!isConnecting && <Link2 className="w-5 h-5" />}
            >
                {label}
            </Button>
        </>
    );
}
