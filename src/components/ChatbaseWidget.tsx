"use client";

import Script from 'next/script';
import { useEffect } from 'react';

export default function ChatbaseWidget() {
    const chatbotId = process.env.NEXT_PUBLIC_CHATBOT_ID;

    useEffect(() => {
        // Identify user with Chatbase after widget loads
        const identifyUser = async () => {
            try {
                // Wait for chatbase to be initialized
                const checkChatbase = setInterval(() => {
                    if (window.chatbase && typeof window.chatbase === 'function') {
                        clearInterval(checkChatbase);

                        // Get JWT token from API
                        fetch('/api/chatbase/token')
                            .then(res => res.json())
                            .then(data => {
                                if (data.token) {
                                    window.chatbase('identify', { token: data.token });
                                    console.log('Chatbase: User identified successfully');
                                }
                            })
                            .catch(err => {
                                console.warn('Chatbase: Failed to identify user', err);
                            });
                    }
                }, 100);

                // Clear interval after 10 seconds if chatbase doesn't load
                setTimeout(() => clearInterval(checkChatbase), 10000);
            } catch (error) {
                console.warn('Chatbase: Error during user identification', error);
            }
        };

        // Run identification after a short delay to ensure script is loaded
        const timer = setTimeout(identifyUser, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!chatbotId) {
        console.warn('Chatbase: NEXT_PUBLIC_CHATBOT_ID is not configured');
        return null;
    }

    return (
        <Script
            id="chatbase-widget"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
                __html: `
                    (function(){
                        if(!window.chatbase || window.chatbase("getState") !== "initialized") {
                            window.chatbase = (...arguments) => {
                                if(!window.chatbase.q) {
                                    window.chatbase.q = []
                                }
                                window.chatbase.q.push(arguments)
                            };
                            window.chatbase = new Proxy(window.chatbase, {
                                get(target, prop) {
                                    if(prop === "q") {
                                        return target.q
                                    }
                                    return (...args) => target(prop, ...args)
                                }
                            })
                        }
                        const onLoad = function() {
                            const script = document.createElement("script");
                            script.src = "https://www.chatbase.co/embed.min.js";
                            script.id = "${chatbotId}";
                            script.domain = "www.chatbase.co";
                            script.defer = true;
                            document.body.appendChild(script)
                        };
                        if(document.readyState === "complete") {
                            onLoad()
                        } else {
                            window.addEventListener("load", onLoad)
                        }
                    })();
                `,
            }}
        />
    );
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        chatbase: any;
    }
}
