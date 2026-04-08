"use client";

import Script from 'next/script';
import { useEffect } from 'react';

export default function ChatbaseWidget() {
    const chatbotId = process.env.NEXT_PUBLIC_CHATBOT_ID;

    useEffect(() => {
        // Identify user with Chatbase after widget loads
        const identifyUser = async () => {
            try {
                const checkChatbase = setInterval(() => {
                    if (window.chatbase && typeof window.chatbase === 'function') {
                        clearInterval(checkChatbase);

                        fetch('/api/chatbase/token')
                            .then(res => res.json())
                            .then(data => {
                                if (data.token) {
                                    window.chatbase('identify', { token: data.token });
                                }
                            })
                            .catch(err => {
                                console.warn('Chatbase: Failed to identify user', err);
                            });
                    }
                }, 500);

                setTimeout(() => clearInterval(checkChatbase), 15000);
            } catch (error) {
                console.warn('Chatbase: Error during user identification', error);
            }
        };

        const timer = setTimeout(identifyUser, 3000);
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
                            if (document.getElementById("${chatbotId}")) return;
                            const script = document.createElement("script");
                            script.crossOrigin = "anonymous";
                            script.src = "https://www.chatbase.co/embed.min.js";
                            script.id = "${chatbotId}";
                            script.setAttribute("chatbotId", "${chatbotId}");
                            script.setAttribute("domain", "www.chatbase.co");
                            script.defer = true;
                            document.body.appendChild(script);
                        };
                        if(document.readyState === "complete") {
                            onLoad();
                        } else {
                            window.addEventListener("load", onLoad);
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
