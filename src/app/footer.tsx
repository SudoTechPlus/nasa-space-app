import { cn } from '@/lib/utils'
import { Satellite } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="py-12">
    <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
        <div>
            <Link
                href="/"
                className={cn(
                    'font-bold transition-all duration-300 flex items-center gap-3 text-2xl md:text-3xl',
                )}
                >
                <Image src="/assets/logo/vector.png" width={40} height={40} alt="logo" />
                <span className="hidden sm:block">
                    <h1 className="leading-6">Airmux</h1>
                    <p className="text-xs font-thin leading-4">Clean Air, Healthy Life</p>
                </span>
            </Link>
        </div>
        
        <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
            <li><Link href="/dashboard" className="hover: transition-colors">Dashboard</Link></li>
            <li><Link href="/map" className="hover: transition-colors">Pollution Map</Link></li>
            <li><Link href="/health" className="hover: transition-colors">Health Risks</Link></li>
            <li><Link href="/rankings" className="hover: transition-colors">City Rankings</Link></li>
            </ul>
        </div>
        
        <div>
            <h4 className="font-semibold mb-4">About TEMPO</h4>
            <ul className="space-y-2 text-gray-400">
            <li><Link href="#mission" className="hover: transition-colors">Mission & Vision</Link></li>
            <li><Link href="#features" className="hover: transition-colors">Features</Link></li>
            <li><Link href="#benefits" className="hover: transition-colors">Benefits</Link></li>
            <li><Link href="https://nasa.gov" target="_blank" className="hover: transition-colors">NASA.gov</Link></li>
            </ul>
        </div>
        
        <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover: transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover: transition-colors">API Access</Link></li>
            <li><Link href="#" className="hover: transition-colors">Contact</Link></li>
            <li><Link href="#" className="hover: transition-colors">Privacy Policy</Link></li>
            </ul>
        </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>© 2025 Airmux/SudoTech+ - Nasa Space Apps. All rights reserved.</p>
        </div>
    </div>
    </footer>
  )
}
