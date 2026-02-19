import Link from "next/link";

export default function NotFound() {
    return (
        <html>
            <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-slate-400">The page you are looking for does not exist.</p>
                    <Link href="/" className="mt-8 inline-block px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
                        Return Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
