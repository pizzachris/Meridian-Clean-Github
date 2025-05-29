'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
	{ href: '/session', label: 'Flashcards', icon: '🃏' },
	{ href: '/quiz', label: 'Quiz', icon: '❓' },
	{ href: '/progress', label: 'Progress', icon: '📈' },
	{ href: '/body-map', label: 'Body Map', icon: '🗺️' },
	{ href: '/symptom-search', label: 'Symptom', icon: '💡' },
	{ href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function NavBar() {
	const pathname = usePathname();
	return (
		<nav className='fixed bottom-0 left-0 w-full bg-[#181818] border-t-2 border-secondary flex justify-around py-3 z-50 shadow-2xl'>
			{navItems.map((item) => {				const isActive =
					pathname === item.href || (item.href === '/session' && pathname.startsWith('/session'));
				return (
					<Link
						key={item.href}
						href={item.href}
						className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-base font-bold transition-all duration-200 font-serif ${
							isActive
								? 'bg-secondary text-black shadow-lg scale-110'
								: 'text-secondary hover:bg-[#222] hover:scale-105'
						}`}
						style={{ minWidth: 64 }}
					>
						<span className='text-xl'>{item.icon}</span>
						<span className='text-xs tracking-wide'>{item.label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
