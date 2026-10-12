let isLoggedIn = false;
        let activePartnerView = null; // null, 'aero', 'hotel', 'retail'
        let isConciergeScreenActive = false; // Tracks immersive check-in screen state
        
        // Partner unlock states
        let aeroSpaUnlocked = false; 
        let hotelTourUnlocked = false;
        let retailCatalogUnlocked = false;

        let hotelConciergeStep = 1;
        let retailConciergeStep = 1;

        function toggleTheme() {
            const html = document.getElementById('html-root');
            const icon = document.getElementById('theme-icon');
            if (html.classList.contains('light')) {
                html.classList.remove('light');
                html.classList.add('dark');
                icon.classList.remove('fa-moon', 'text-slate-700');
                icon.classList.add('fa-sun', 'text-amber-300');
                localStorage.setItem('aura_theme', 'dark');
            } else {
                html.classList.remove('dark');
                html.classList.add('light');
                icon.classList.remove('fa-sun', 'text-amber-300');
                icon.classList.add('fa-moon', 'text-slate-700');
                localStorage.setItem('aura_theme', 'light');
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            const saved = localStorage.getItem('aura_theme') || 'light';
            const html = document.getElementById('html-root');
            const icon = document.getElementById('theme-icon');
            if (saved === 'dark') {
                html.classList.remove('light');
                html.classList.add('dark');
                icon.classList.remove('fa-sun', 'text-amber-300');
                icon.classList.add('fa-moon', 'text-slate-700');
            }
            renderApp();
        });


        // Keep the shared shell aligned with the current Aura Platinum or partner context.
        function syncShellContext() {
            const label = document.getElementById('nav-experience-label');
            const footer = document.getElementById('footer-brand-context');
            const privacy = document.getElementById('footer-privacy-link');
            const terms = document.getElementById('footer-terms-link');
            const support = document.getElementById('footer-support-link');
            if (!label || !footer || !privacy || !terms || !support) return;

            const partners = {
                aero: { name: 'Aero Luxe Aviation', support: 'Aero Luxe Concierge', detail: 'Flight, lounge and chauffeur benefits are provided through the Aero Luxe Aviation partner experience.' },
                hotel: { name: 'Grand Hotelier', support: 'Grand Hotelier Concierge', detail: 'Reservation, suite and hospitality benefits are provided through the Grand Hotelier partner experience.' },
                retail: { name: 'Chronos Vendôme', support: 'Chronos Vendôme Concierge', detail: 'Boutique, appointment and horology benefits are provided through the Chronos Vendôme partner experience.' }
            };
            const partner = activePartnerView ? partners[activePartnerView] : null;

            label.textContent = partner ? partner.name : 'Aura Platinum';
            label.classList.add('is-visible');
            label.setAttribute('aria-hidden', 'false');

            if (partner) {
                footer.innerHTML = '&copy; 2026 Aura Platinum Financial &middot; ' + partner.name + ' Partner Experience.';
                privacy.textContent = 'Partner Privacy';
                terms.textContent = 'Benefit Terms';
                support.textContent = 'Partner Support';
                privacy.setAttribute('aria-label', partner.name + ' privacy information');
                terms.setAttribute('aria-label', partner.name + ' benefit terms');
                support.setAttribute('aria-label', partner.name + ' support');
            } else {
                footer.innerHTML = '&copy; 2026 Aura Platinum Financial. All rights reserved.';
                privacy.textContent = 'Privacy';
                terms.textContent = 'Terms';
                support.textContent = 'Support';
                privacy.setAttribute('aria-label', 'Aura Platinum privacy information');
                terms.setAttribute('aria-label', 'Aura Platinum terms of service');
                support.setAttribute('aria-label', 'Aura Platinum support');
            }
        }

        function showFooterInfo(type) {
            const partners = {
                aero: { name: 'Aero Luxe Aviation', support: 'Aero Luxe Concierge', detail: 'Flight, lounge and chauffeur benefits are provided through the Aero Luxe Aviation partner experience.' },
                hotel: { name: 'Grand Hotelier', support: 'Grand Hotelier Concierge', detail: 'Reservation, suite and hospitality benefits are provided through the Grand Hotelier partner experience.' },
                retail: { name: 'Chronos Vendôme', support: 'Chronos Vendôme Concierge', detail: 'Boutique, appointment and horology benefits are provided through the Chronos Vendôme partner experience.' }
            };
            const partner = activePartnerView ? partners[activePartnerView] : null;
            if (type === 'privacy') {
                showToast(partner ? partner.name + ' Privacy' : 'Aura Platinum Privacy', partner ? partner.detail + ' Aura Platinum member information remains governed by applicable privacy standards.' : 'Aura Platinum applies strict banking confidentiality and member privacy standards.');
            } else if (type === 'terms') {
                showToast(partner ? partner.name + ' Benefit Terms' : 'Aura Platinum Terms of Service', partner ? 'Partner-specific eligibility, availability and redemption conditions apply to ' + partner.name + ' benefits.' : 'The World Elite Member Agreement governs Aura Platinum catalog access and benefit redemptions.');
            } else if (type === 'support') {
                showToast(partner ? partner.support : 'Aura Platinum Concierge', partner ? 'For assistance with this partner journey, contact ' + partner.support + ' through your Aura Platinum relationship team.' : 'Aura Platinum Concierge is available 24/7 at +1 (800) 555-AURA.');
            }
        }

        function handleLogoClick() {
            activePartnerView = null;
            isConciergeScreenActive = false;
            document.getElementById('push-notification-container').innerHTML = ''; // clear notifications on dashboard switch
            if (isLoggedIn) {
                showToast('Aura Dashboard', 'You are signed in as Sarah Jenkins.');
            } else {
                openLoginModal();
            }
            renderApp();
        }

        function renderApp() {
            syncShellContext();
            const container = document.getElementById('main-container');
            const navLogoBtn = document.getElementById('nav-logo-btn');
            const navLogoIcon = document.getElementById('nav-logo-icon');
            const authHeaderBtn = document.getElementById('auth-header-btn-container');

            if (activePartnerView) {
                if (isConciergeScreenActive) {
                    if (activePartnerView === 'aero') renderConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn);
                    else if (activePartnerView === 'hotel') renderHotelConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn);
                    else if (activePartnerView === 'retail') renderRetailConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn);
                    return;
                }
                renderPartnerJourney(container, navLogoBtn, navLogoIcon, authHeaderBtn);
                return;
            }

            if (!isLoggedIn) {
                navLogoBtn.className = "w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-aura-500 transition-all flex items-center justify-center bg-aura-500 text-white shadow-lg shadow-aura-500/30 focus:outline-none focus:ring-2 focus:ring-aura-500";
                navLogoIcon.className = "fa-solid fa-crown text-base";
                authHeaderBtn.innerHTML = `
                    <button onclick="openLoginModal()" class="w-11 h-11 rounded-xl bg-aura-500 text-white flex items-center justify-center hover:bg-aura-600 transition-colors shadow-lg shadow-aura-500/20 focus:ring-2 focus:ring-aura-500" aria-label="Sign In">
                        <i class="fa-solid fa-right-to-bracket text-base" aria-hidden="true"></i>
                    </button>
                `;
                container.innerHTML = `
                    <!-- Full-Bleed Responsive Public Hero Section with transparent dark overlay and live motion -->
                    <section class="relative w-full min-h-[85vh] flex items-center overflow-hidden py-16">
                        <div class="absolute inset-0 z-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" alt="Luxury Estate" onerror="this.src='https://placehold.co/2000x1200/090d16/ffffff?text=Aura+Platinum+Luxury';" class="w-full h-full object-cover animate-ken-burns">
                            <div class="absolute inset-0 bg-slate-950/50"></div>
                        </div>
                        <div class="relative z-10 w-full px-6 lg:px-12 max-w-7xl mx-auto text-center lg:text-left">
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div class="lg:col-span-8 space-y-6">
                                    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-aura-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase border border-aura-500/30">
                                        <span class="w-2 h-2 rounded-full bg-blue-400" aria-hidden="true"></span>
                                        <span>World Elite Privileges</span>
                                    </div>
                                    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                                        Uncompromising Luxury, <br>
                                        <span class="text-blue-300">Engineered for Exclusivity.</span>
                                    </h1>
                                    <p class="text-slate-200 text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow">
                                        Discover frictionless access to premier travel, hospitality, and luxury retail partners through your Aura Platinum membership. Sign in to view your personalized catalog.
                                    </p>
                                    <div class="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <button onclick="openLoginModal()" class="px-8 py-4 rounded-xl bg-aura-500 text-white font-bold text-sm shadow-xl shadow-aura-500/30 hover:bg-aura-600 transition-all">
                                            Sign In to Account
                                        </button>
                                        <button onclick="document.getElementById('public-partners').scrollIntoView({behavior: 'smooth'})" class="px-8 py-4 rounded-xl bg-slate-800/80 backdrop-blur-md text-slate-200 border border-slate-700 font-bold text-sm hover:bg-slate-700 transition-all">
                                            Explore Public Catalog
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Public Partner Preview Section with Half-Height Image Cards -->
                    <section id="public-partners" class="w-full py-24 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#070b14]">
                        <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto">
                            <div class="text-center max-w-2xl mx-auto mb-16">
                                <h2 class="text-3xl font-extrabold tracking-tight mb-3">Premier Channel Partners</h2>
                                <p class="text-slate-600 dark:text-slate-300 text-base font-medium">Sign in to unlock personalized member rates and instant benefit redemption.</p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800" alt="Private Jet" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Aero+Luxe';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Travels</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Aero Luxe Aviation</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Unlimited VIP airport lounge access and 12 complimentary chauffeur transfers per year.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="openLoginModal()" class="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-aura-500 hover:text-white transition-all">
                                            Sign In to View Perks
                                        </button>
                                    </div>
                                </div>
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" alt="Luxury Suite" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Grand+Hotelier';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Hospitality</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Grand Hotelier</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Guaranteed room upgrades to presidential suites at partner five-star hotels with daily breakfast.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="openLoginModal()" class="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-aura-500 hover:text-white transition-all">
                                            Sign In to View Perks
                                        </button>
                                    </div>
                                </div>
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" alt="Boutique" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Chronos+Vendome';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Retail</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Chronos Vendome</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Private after-hours salon access at flagship designer boutiques in Paris, Milan, and New York.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="openLoginModal()" class="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-aura-500 hover:text-white transition-all">
                                            Sign In to View Perks
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                `;
            } else {
                navLogoBtn.className = "w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-aura-500 transition-all flex items-center justify-center bg-aura-500 text-white shadow-lg shadow-aura-500/30 focus:outline-none focus:ring-2 focus:ring-aura-500";
                navLogoIcon.className = "fa-solid fa-crown text-base";
                authHeaderBtn.innerHTML = `
                    <button onclick="handleLogout()" class="w-11 h-11 rounded-xl border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors focus:ring-2 focus:ring-red-500" title="Sign Out">
                        <i class="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                    </button>
                `;
                container.innerHTML = `
                    <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">
                        <!-- Logged-in Header Banner with Professional Sarah Portrait & Card Showcase -->
                        <div class="card-box rounded-3xl p-8 lg:p-12 mb-12 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-96 h-96 bg-aura-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                                <div class="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
                                    <div class="relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins Portrait" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah+Jenkins';" class="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-2 border-aura-500 shadow-2xl">
                                        <div class="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg" title="Active World Elite Member">
                                            <i class="fa-solid fa-check" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-aura-500/10 text-aura-500 text-xs font-bold uppercase tracking-wider border border-aura-500/20">
                                            <span>World Elite Member</span>
                                        </div>
                                        <h1 class="text-3xl lg:text-4xl font-extrabold">Sarah Jenkins</h1>
                                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Private Wealth Account ID: #AP-9948-8842</p>
                                        <p class="text-slate-600 dark:text-slate-300 text-xs font-medium pt-1">Global Private Banking & Concierge Tier &bull; Verified Portfolio</p>
                                    </div>
                                </div>

                                <!-- Red Metal Card Mini Showcase -->
                                <div class="lg:col-span-4 flex justify-center lg:justify-end">
                                    <div class="w-full max-w-xs h-48 rounded-2xl card-red-gradient p-6 text-white shadow-2xl relative flex flex-col justify-between border border-red-400/30 transform hover:scale-105 transition-transform duration-300">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <p class="text-[9px] tracking-widest uppercase text-red-200 font-semibold">AURA PLATINUM</p>
                                                <p class="text-sm font-black tracking-wide">WORLD ELITE</p>
                                            </div>
                                            <i class="fa-solid fa-wifi text-red-200 text-sm" aria-hidden="true"></i>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-6 rounded bg-amber-200/90 flex items-center justify-center" aria-hidden="true"></div>
                                            <span class="font-mono text-sm tracking-widest text-red-100 font-bold">•••• 8842</span>
                                        </div>
                                        <div class="flex justify-between items-end text-xs">
                                            <p class="font-bold tracking-wider text-xs">SARAH JENKINS</p>
                                            <i class="fa-brands fa-cc-visa text-2xl text-white" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Logged-in Partner Benefits Catalog with Half-Height Image Cards -->
                        <div class="mb-16">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 class="text-2xl font-extrabold tracking-tight">Your Member Benefits Catalog</h2>
                                    <p class="text-slate-600 dark:text-slate-300 text-sm font-medium">Simulate navigation directly into partner ecosystems.</p>
                                </div>
                                <span class="px-3.5 py-1.5 rounded-xl bg-aura-500/10 text-aura-500 font-bold text-xs uppercase tracking-wider border border-aura-500/20">3 Connected Partners</span>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <!-- Partner 1: Aero Luxe Aviation -->
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-aura-500 transition-all">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800" alt="Private Jet" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Aero+Luxe';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Travels</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Aero Luxe Aviation</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Booked flight SIN &rarr; LHR. Unlimited VIP lounge access & priority boarding attached via Aura Platinum card.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="launchPartnerJourney('aero')" class="w-full py-3.5 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2">
                                            <span>Open Airline Experience</span>
                                            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Partner 2: Grand Hotelier -->
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-aura-500 transition-all">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" alt="Luxury Suite" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Grand+Hotelier';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Hospitality</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Grand Hotelier</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Upcoming Mayfair London Suite reservation. Guaranteed room upgrade & $100 spa credit linked.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="launchPartnerJourney('hotel')" class="w-full py-3.5 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2">
                                            <span>Open Hotel Experience</span>
                                            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Partner 3: Chronos Vendome -->
                                <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-aura-500 transition-all">
                                    <div class="h-48 w-full overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" alt="Boutique" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Chronos+Vendome';" class="w-full h-full object-cover card-image-motion">
                                        <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Retail</div>
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">Chronos Vendome</h3>
                                        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Paris Flagship Salon appointment. Private after-hours salon access & personal shopper attached.</p>
                                    </div>
                                    <div class="p-6 pt-0">
                                        <button onclick="launchPartnerJourney('retail')" class="w-full py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2">
                                            <span>Open Retail Experience</span>
                                            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        function launchPartnerJourney(partnerKey) {
            activePartnerView = partnerKey;
            isConciergeScreenActive = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            renderApp();

            setTimeout(() => {
                if (partnerKey === 'aero') {
                    showPushNotification('Aero Luxe Aviation', 'Live telemetry: Flight AL-882 gate confirmed T3 Gate B12. Fast-track biometric scan active.', 'sky');
                } else if (partnerKey === 'hotel') {
                    showPushNotification('Grand Hotelier', 'Mayfair Suite upgrade verified! Weather telemetry sync active for London.', 'amber');
                } else if (partnerKey === 'retail') {
                    showPushNotification('Chronos Vendome', 'Place Vendôme private salon prepared. Anniversary horology catalog ready.', 'rose');
                }
            }, 800);
        }

        function handleBookingInteraction(actionType) {
            if (activePartnerView === 'aero') {
                if (actionType === 'ticket') {
                    showPushNotification('Aero Luxe Aviation', 'Boarding pass #8842-SIN synced with Apple Wallet.', 'sky');
                } else if (actionType === 'lounge') {
                    isConciergeScreenActive = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    renderApp();
                    showPushNotification('Changi T3 VIP Lounge', 'Lounge check-in terminal active. Please verify your Aura Platinum card details.', 'sky');
                } else if (actionType === 'chauffeur') {
                    showPushNotification('Aero Luxe Aviation', 'Maybach S-Class driver en route to Heathrow arrivals.', 'sky');
                } else if (actionType === 'spa') {
                    showPushNotification('Spiritual Sanctuary Spa', 'Your private 60-minute hydro-aromatherapy session voucher is redeemed at T3 Lounge Annex.', 'sky');
                }
            } else if (activePartnerView === 'hotel') {
                if (actionType === 'booking') {
                    showPushNotification('Grand Hotelier', 'Mayfair Suite keycard loaded into digital wallet.', 'amber');
                } else if (actionType === 'breakfast') {
                    showPushNotification('Grand Hotelier', 'Champagne breakfast voucher validated for tomorrow at 9:00 AM.', 'amber');
                } else if (actionType === 'spa') {
                    showPushNotification('Grand Hotelier', '$100 hydrotherapy credit applied to room folio.', 'amber');
                } else if (actionType === 'museum') {
                    showPushNotification('Mayfair Private Tour', 'Private museum access pass added to digital wallet.', 'amber');
                }
            } else if (activePartnerView === 'retail') {
                if (actionType === 'appointment') {
                    showPushNotification('Chronos Vendome', 'Place Vendôme security clearance verified for 8:00 PM.', 'rose');
                } else if (actionType === 'salon') {
                    showPushNotification('Chronos Vendome', 'Private viewing room #3 reserved with master horologist.', 'rose');
                } else if (actionType === 'tasting') {
                    showPushNotification('Chronos Vendome', 'Sommelier notified for vintage Dom Pérignon reception.', 'rose');
                } else if (actionType === 'catalog') {
                    showPushNotification('Chronos Vendome', 'Limited-edition horology catalog synced with your account.', 'rose');
                }
            }
        }

        // --- AERO LUXE LOUNGE CHECK-IN SCREEN ---
        let conciergeStep = 1; 

        function renderConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn) {
            navLogoBtn.className = "w-11 h-11 rounded-xl border border-sky-500/30 hover:border-sky-500 transition-all flex items-center justify-center bg-sky-600 text-white shadow-lg shadow-sky-600/30 focus:outline-none focus:ring-2 focus:ring-sky-500";
            navLogoIcon.className = "fa-solid fa-plane text-base";
            authHeaderBtn.innerHTML = `
                <button onclick="handleLogout()" class="w-11 h-11 rounded-xl border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors focus:ring-2 focus:ring-red-500" title="Sign Out">
                    <i class="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                </button>
            `;

            let stepContentHtml = '';

            if (conciergeStep === 1) {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-sky-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Changi T3 First Class Suite &bull; May 14, 2026</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-sky-500/30">
                            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <h3 class="text-lg font-extrabold">Lounge Card Verification</h3>
                                    <p class="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">Enter mobile & security PIN to claim access</p>
                                </div>
                                <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold">
                                    Cancel
                                </button>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Mobile Number</label>
                                    <input type="text" value="+65 9123 4567" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 text-sm font-medium">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">One-Time Security PIN (OTP)</label>
                                    <input type="text" value="8 8 4 2 0 1" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 text-sm font-mono tracking-widest text-center font-bold">
                                </div>
                                <button onclick="verifyConciergeScreenOTP()" class="w-full py-4 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-xl shadow-sky-600/30 hover:bg-sky-700 transition-colors">
                                    Verify & Confirm Lounge Access
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto animate-slide-in">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-sky-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Changi T3 First Class Suite &bull; May 14, 2026</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-sky-500/40 space-y-6 bg-sky-50/20 dark:bg-sky-950/20">
                            <div>
                                <h4 class="text-2xl font-extrabold mb-1">Spiritual Sanctuary Spa Session</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Your recent travel has accumulated enough reward points in your Aura Platinum account to unlock a complimentary 60-minute hydro-aromatherapy session at the T3 Airport Lounge Annex.
                                </p>
                            </div>
                            <button onclick="handleClaimSpaBenefit()" class="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30 hover:opacity-90 transition-all">
                                Claim Spa Benefit Now
                            </button>
                        </div>

                        <div class="text-center pt-2">
                            <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold">
                                &larr; Return to Lounge Access
                            </button>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <section class="relative w-full min-h-[55vh] flex items-center justify-center text-center overflow-hidden py-16">
                    <div class="absolute inset-0 z-0 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000" alt="Airport Lounge Concierge" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Lounge+Concierge';" class="w-full h-full object-cover animate-ken-burns">
                        <div class="absolute inset-0 bg-slate-950/50"></div>
                    </div>
                    <div class="relative z-10 w-full px-6 lg:px-12 max-w-4xl mx-auto space-y-4">
                        <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-widest border border-sky-500/40 shadow-lg">
                            <i class="fa-solid fa-plane text-sm" aria-hidden="true"></i>
                            <span>Spiritual Sanctuary Spa &bull; Changi T3 Lounge</span>
                        </div>
                        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Airport Concierge & Wellness
                        </h1>
                        <p class="text-sky-200 text-base sm:text-lg font-medium max-w-xl mx-auto drop-shadow">
                            Bespoke hospitality and instant reward redemptions.
                        </p>
                        <div class="pt-4">
                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </section>
                <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">${stepContentHtml}</div>
            `;
        }

        function verifyConciergeScreenOTP() {
            conciergeStep = 2;
            showPushNotification('Changi T3 VIP Lounge', 'Lounge access verified successfully for Sarah Jenkins!', 'sky');
            if (!aeroSpaUnlocked) {
                aeroSpaUnlocked = true;
                setTimeout(() => {
                    showPushNotification('Aura Platinum Concierge', 'Complimentary Spiritual Sanctuary Spa session unlocked.', 'sky');
                }, 800);
            }
            renderApp();
        }

        function handleClaimSpaBenefit() {
            showPushNotification('Spiritual Sanctuary Spa', 'Spa pass claimed and added to your Apple Wallet & Aura Platinum profile!', 'sky');
            isConciergeScreenActive = false;
            renderApp();
        }


        // --- GRAND HOTELIER CHECK-IN & WEATHER SYNC SCREEN ---
        function renderHotelConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn) {
            navLogoBtn.className = "w-11 h-11 rounded-xl border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center bg-amber-600 text-white shadow-lg shadow-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500";
            navLogoIcon.className = "fa-solid fa-hotel text-base";
            authHeaderBtn.innerHTML = `
                <button onclick="handleLogout()" class="w-11 h-11 rounded-xl border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors focus:ring-2 focus:ring-red-500" title="Sign Out">
                    <i class="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                </button>
            `;

            let stepContentHtml = '';

            if (hotelConciergeStep === 1) {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-amber-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Mayfair Suite #442 &bull; May 14, 2026</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-amber-500/30">
                            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <h3 class="text-lg font-extrabold">Mayfair Suite Check-in Verification</h3>
                                    <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Enter mobile & security PIN to confirm reservation</p>
                                </div>
                                <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold">
                                    Cancel
                                </button>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Mobile Number</label>
                                    <input type="text" value="+44 20 7946 0992" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-sm font-medium">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">One-Time Security PIN (OTP)</label>
                                    <input type="text" value="4 4 2 0 2 6" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-sm font-mono tracking-widest text-center font-bold">
                                </div>
                                <button onclick="verifyHotelConciergeOTP()" class="w-full py-4 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-xl shadow-amber-600/30 hover:bg-amber-700 transition-colors">
                                    Verify & Confirm Suite Reservation
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto animate-slide-in">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-amber-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Mayfair Suite #442 &bull; May 14, 2026</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-amber-500/40 space-y-6 bg-amber-50/20 dark:bg-amber-950/20">
                            <div>
                                <h4 class="text-2xl font-extrabold mb-1">Private Museum Tour Pass</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Due to afternoon rain showers in London, Grand Hotelier has unlocked a complimentary private indoor museum tour pass for you.
                                </p>
                            </div>
                            <button onclick="handleClaimMuseumPass()" class="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 hover:opacity-90 transition-all">
                                Claim Museum Pass Now
                            </button>
                        </div>

                        <div class="text-center pt-2">
                            <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold">
                                &larr; Return to Reservation
                            </button>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <section class="relative w-full min-h-[55vh] flex items-center justify-center text-center overflow-hidden py-16">
                    <div class="absolute inset-0 z-0 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" alt="Mayfair Suite" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Mayfair+Suite';" class="w-full h-full object-cover animate-ken-burns">
                        <div class="absolute inset-0 bg-slate-950/50"></div>
                    </div>
                    <div class="relative z-10 w-full px-6 lg:px-12 max-w-4xl mx-auto space-y-4">
                        <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/40 shadow-lg">
                            <i class="fa-solid fa-hotel text-sm" aria-hidden="true"></i>
                            <span>Grand Hotelier Partner Ecosystem</span>
                        </div>
                        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Mayfair London Suite
                        </h1>
                        <p class="text-amber-200 text-base sm:text-lg font-medium max-w-xl mx-auto drop-shadow">
                            Unrivaled elegance in the heart of Mayfair.
                        </p>
                        <div class="pt-4">
                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </section>
                <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">${stepContentHtml}</div>
            `;
        }

        function verifyHotelConciergeOTP() {
            hotelConciergeStep = 2;
            showPushNotification('Grand Hotelier', 'Mayfair Suite reservation verified successfully for Sarah Jenkins!', 'amber');
            if (!hotelTourUnlocked) {
                hotelTourUnlocked = true;
                setTimeout(() => {
                    showPushNotification('Grand Hotelier Weather Sync', 'Rain detected in London. Private museum tour pass unlocked!', 'amber');
                }, 800);
            }
            renderApp();
        }

        function handleClaimMuseumPass() {
            showPushNotification('Private Museum Tour', 'Museum pass claimed and added to your digital wallet!', 'amber');
            isConciergeScreenActive = false;
            renderApp();
        }


        // --- CHRONOS VENDOME CHECK-IN & HOROLOGY CATALOG SCREEN ---
        function renderRetailConciergeScreen(container, navLogoBtn, navLogoIcon, authHeaderBtn) {
            navLogoBtn.className = "w-11 h-11 rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all flex items-center justify-center bg-rose-600 text-white shadow-lg shadow-rose-600/30 focus:outline-none focus:ring-2 focus:ring-rose-500";
            navLogoIcon.className = "fa-solid fa-gem text-base";
            authHeaderBtn.innerHTML = `
                <button onclick="handleLogout()" class="w-11 h-11 rounded-xl border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors focus:ring-2 focus:ring-red-500" title="Sign Out">
                    <i class="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                </button>
            `;

            let stepContentHtml = '';

            if (retailConciergeStep === 1) {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-rose-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-rose-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Paris Flagship &bull; May 16, 2026 (8:00 PM)</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-rose-500/30">
                            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <h3 class="text-lg font-extrabold">Boutique Appointment Verification</h3>
                                    <p class="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">Enter mobile & security PIN to verify security clearance</p>
                                </div>
                                <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold">
                                    Cancel
                                </button>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Mobile Number</label>
                                    <input type="text" value="+33 1 42 68 55 00" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-sm font-medium">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">One-Time Security PIN (OTP)</label>
                                    <input type="text" value="9 9 4 2 0 8" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-sm font-mono tracking-widest text-center font-bold">
                                </div>
                                <button onclick="verifyRetailConciergeOTP()" class="w-full py-4 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-colors">
                                    Verify & Unlock Salon Access
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                stepContentHtml = `
                    <div class="space-y-8 max-w-xl mx-auto animate-slide-in">
                        <div class="card-box rounded-3xl p-6 shadow-xl border-rose-500/30 flex items-center space-x-6">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah Jenkins" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-20 h-20 rounded-2xl object-cover border-2 border-rose-400 shadow-md flex-shrink-0">
                            <div class="space-y-1">
                                <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                                    <span>World Elite Member</span>
                                </div>
                                <h3 class="text-xl font-extrabold">Sarah Jenkins</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Paris Flagship &bull; May 16, 2026 (8:00 PM)</p>
                            </div>
                        </div>

                        <div class="card-box rounded-3xl p-8 shadow-2xl border-rose-500/40 space-y-6 bg-rose-50/20 dark:bg-rose-950/20">
                            <div>
                                <h4 class="text-2xl font-extrabold mb-1">Limited-Edition Horology Catalog</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    In recognition of your Aura Platinum anniversary, an exclusive preview catalog of rare timepieces has been unlocked for your private salon session.
                                </p>
                            </div>
                            <button onclick="handleClaimHorologyCatalog()" class="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 hover:opacity-90 transition-all">
                                View Horology Catalog
                            </button>
                        </div>

                        <div class="text-center pt-2">
                            <button onclick="isConciergeScreenActive = false; renderApp();" class="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold">
                                &larr; Return to Appointment
                            </button>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <section class="relative w-full min-h-[55vh] flex items-center justify-center text-center overflow-hidden py-16">
                    <div class="absolute inset-0 z-0 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" alt="Boutique" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Boutique';" class="w-full h-full object-cover animate-ken-burns">
                        <div class="absolute inset-0 bg-slate-950/50"></div>
                    </div>
                    <div class="relative z-10 w-full px-6 lg:px-12 max-w-4xl mx-auto space-y-4">
                        <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-widest border border-rose-500/40 shadow-lg">
                            <i class="fa-solid fa-gem text-sm" aria-hidden="true"></i>
                            <span>Chronos Vendome Partner Ecosystem</span>
                        </div>
                        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Paris Flagship Salon
                        </h1>
                        <p class="text-rose-200 text-base sm:text-lg font-medium max-w-xl mx-auto drop-shadow">
                            Exquisite horology and bespoke fine jewelry.
                        </p>
                        <div class="pt-4">
                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </section>
                <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">${stepContentHtml}</div>
            `;
        }

        function verifyRetailConciergeOTP() {
            retailConciergeStep = 2;
            showPushNotification('Chronos Vendome', 'Place Vendôme salon security clearance verified successfully!', 'rose');
            if (!retailCatalogUnlocked) {
                retailCatalogUnlocked = true;
                setTimeout(() => {
                    showPushNotification('Chronos Vendome VIP', 'Anniversary milestone verified. Horology catalog preview unlocked!', 'rose');
                }, 800);
            }
            renderApp();
        }

        function handleClaimHorologyCatalog() {
            showPushNotification('Horology Catalog', 'Exclusive catalog synced with your secure private banking profile!', 'rose');
            isConciergeScreenActive = false;
            renderApp();
        }

        function showPushNotification(title, message, themeColor) {
            const container = document.getElementById('push-notification-container');
            const notifId = 'notif-' + Date.now();
            
            let bgClasses = '';
            let borderClasses = '';
            let iconMarkup = '';

            if (themeColor === 'sky') {
                bgClasses = 'bg-sky-50 dark:bg-sky-950/90 text-sky-950 dark:text-sky-100';
                borderClasses = 'border-sky-300 dark:border-sky-800 shadow-sky-500/10';
                iconMarkup = '<div class="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-md"><i class="fa-solid fa-plane text-sm" aria-hidden="true"></i></div>';
            } else if (themeColor === 'amber') {
                bgClasses = 'bg-amber-50 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100';
                borderClasses = 'border-amber-300 dark:border-amber-800 shadow-amber-500/10';
                iconMarkup = '<div class="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-md"><i class="fa-solid fa-hotel text-sm" aria-hidden="true"></i></div>';
            } else if (themeColor === 'rose') {
                bgClasses = 'bg-rose-50 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100';
                borderClasses = 'border-rose-300 dark:border-rose-800 shadow-rose-500/10';
                iconMarkup = '<div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md"><i class="fa-solid fa-gem text-sm" aria-hidden="true"></i></div>';
            }

            const notifEl = document.createElement('div');
            notifEl.id = notifId;
            notifEl.className = `pointer-events-auto card-box rounded-2xl p-4 shadow-2xl border flex items-start space-x-3 animate-slide-in ${bgClasses} ${borderClasses}`;
            notifEl.innerHTML = `
                ${iconMarkup}
                <div class="flex-grow pr-2">
                    <div class="flex items-center justify-between">
                        <h6 class="text-xs font-bold uppercase tracking-wider">${title}</h6>
                        <span class="text-[10px] opacity-70">Just now</span>
                    </div>
                    <p class="text-xs font-medium mt-1 leading-relaxed opacity-90">${message}</p>
                </div>
                <button onclick="document.getElementById('${notifId}').remove()" class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1" aria-label="Dismiss notification">
                    <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
                </button>
            `;

            container.appendChild(notifEl);

            setTimeout(() => {
                const el = document.getElementById(notifId);
                if (el) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateX(100%)';
                    el.style.transition = 'all 0.3s ease';
                    setTimeout(() => el.remove(), 300);
                }
            }, 6000);
        }

        function renderPartnerJourney(container, navLogoBtn, navLogoIcon, authHeaderBtn) {
            authHeaderBtn.innerHTML = `
                <button onclick="handleLogout()" class="w-11 h-11 rounded-xl border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors focus:ring-2 focus:ring-red-500" title="Sign Out">
                    <i class="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                </button>
            `;

            if (activePartnerView === 'aero') {
                navLogoBtn.className = "w-11 h-11 rounded-xl border border-sky-500/30 hover:border-sky-500 transition-all flex items-center justify-center bg-sky-600 text-white shadow-lg shadow-sky-600/30 focus:outline-none focus:ring-2 focus:ring-sky-500";
                navLogoIcon.className = "fa-solid fa-plane text-base";

                let gridCardsHtml = `
                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800" alt="Flight" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Flight';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Itinerary</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Flight AL-882 Summary</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Departure: SIN Terminal 3 &bull; Arrival: LHR Terminal 5 &bull; Seat 2A First Class Suite confirmed.</p>
                            <button onclick="handleBookingInteraction('ticket')" class="w-full py-3.5 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30">
                                View Ticket Details
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" alt="Lounge" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Lounge';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Unlimited VIP Lounge Access</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Complimentary access to Changi T3 VIP lounge. Enter lounge check-in screen to verify card.</p>
                            <button onclick="handleBookingInteraction('lounge')" class="w-full py-3.5 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2">
                                <i class="fa-solid fa-concierge-bell" aria-hidden="true"></i>
                                <span>Open Lounge Check-in</span>
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1550355191-aa80b5035a9c?auto=format&fit=crop&q=80&w=800" alt="Car" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Transfer';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Chauffeur Airport Transfer</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Mercedes Maybach S-Class reserved for airport pickup upon arrival in London.</p>
                            <button onclick="handleBookingInteraction('chauffeur')" class="w-full py-3.5 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30">
                                View Chauffeur Details
                            </button>
                        </div>
                    </div>
                `;

                if (aeroSpaUnlocked) {
                    gridCardsHtml += `
                        <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-sky-400 bg-sky-50/20 dark:bg-sky-950/20 animate-slide-in group">
                            <div class="h-48 w-full relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" alt="Spa" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Spa';" class="w-full h-full object-cover card-image-motion">
                                <div class="absolute top-4 left-4 bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg z-10">Partner Benefit Unlocked</div>
                            </div>
                            <div class="p-6">
                                <div class="flex items-center space-x-2 text-sky-500 text-xs font-extrabold uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
                                    <span>Changi T3 Annex Partner</span>
                                </div>
                                <h3 class="text-xl font-bold mb-2">Spiritual Sanctuary Spa</h3>
                                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Unlocked via lounge verification! Complimentary 60-min hydro-aromatherapy session ready right inside T3 Lounge.</p>
                                <button onclick="handleBookingInteraction('spa')" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-sky-600/30">
                                    Claim Spa Pass Now
                                </button>
                            </div>
                        </div>
                    `;
                }

                container.innerHTML = `
                    <section class="relative w-full min-h-[60vh] flex items-center overflow-hidden py-16">
                        <div class="absolute inset-0 z-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000" alt="Aero Hero" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Aero';" class="w-full h-full object-cover animate-ken-burns">
                            <div class="absolute inset-0 bg-slate-950/50"></div>
                        </div>
                        <div class="relative z-10 w-full px-6 lg:px-12 max-w-7xl mx-auto">
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div class="lg:col-span-12 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-2 border-sky-400 shadow-2xl flex-shrink-0">
                                    <div class="space-y-3 flex-grow">
                                        <h1 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Sarah Jenkins</h1>
                                        <p class="text-sky-300 text-base font-bold drop-shadow">Singapore (SIN) &rarr; London (LHR) &bull; Flight AL-882 &bull; May 14, 2026</p>
                                        <p class="text-slate-200 text-xs sm:text-sm font-medium max-w-xl drop-shadow">First Class Suite &bull; Priority VIP Lounge Access & Chauffeur Transfer Attached.</p>
                                        <div class="pt-2">
                                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">
                        <div class="text-center max-w-2xl mx-auto mb-12">
                            <h2 class="text-3xl font-extrabold tracking-tight mb-2">Itinerary & Privileges</h2>
                            <p class="text-slate-600 dark:text-slate-300 text-sm font-medium">Your active flight booking and connected member perks.</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">${gridCardsHtml}</div>
                    </div>
                `;
            } else if (activePartnerView === 'hotel') {
                navLogoBtn.className = "w-11 h-11 rounded-xl border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center bg-amber-600 text-white shadow-lg shadow-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500";
                navLogoIcon.className = "fa-solid fa-hotel text-base";

                let hotelGridHtml = `
                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" alt="Suite" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Suite';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Booking</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Mayfair Suite #442</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Check-in: May 14 &bull; Check-out: May 21 &bull; 24h Butler Service & Suite Check-in.</p>
                            <button onclick="isConciergeScreenActive = true; window.scrollTo({top: 0, behavior: 'smooth'}); renderApp();" class="w-full py-3.5 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2">
                                <i class="fa-solid fa-concierge-bell" aria-hidden="true"></i>
                                <span>Open Suite Check-in</span>
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800" alt="Breakfast" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Breakfast';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Champagne Breakfast</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Complimentary daily à la carte breakfast with vintage champagne for two at the Mayfair dining room.</p>
                            <button onclick="handleBookingInteraction('breakfast')" class="w-full py-3.5 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/30">
                                View Breakfast Voucher
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800" alt="Spa" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Spa';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">$100 Spa & Wellness Credit</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Applicable to all signature Mayfair spa treatments and hydrothermal circuit passes.</p>
                            <button onclick="handleBookingInteraction('spa')" class="w-full py-3.5 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/30">
                                View Spa Credit
                            </button>
                        </div>
                    </div>
                `;

                if (hotelTourUnlocked) {
                    hotelGridHtml += `
                        <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 animate-slide-in group">
                            <div class="h-48 w-full relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1565060973883-5a248f99e477?auto=format&fit=crop&q=80&w=800" alt="Museum" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Museum';" class="w-full h-full object-cover card-image-motion">
                                <div class="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg z-10">Weather Sync Unlocked</div>
                            </div>
                            <div class="p-6">
                                <div class="flex items-center space-x-2 text-amber-500 text-xs font-extrabold uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
                                    <span>London Weather Telemetry</span>
                                </div>
                                <h3 class="text-xl font-bold mb-2">Private Museum Tour</h3>
                                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Unlocked due to afternoon rain showers! Complimentary private gallery tour pass ready for redemption.</p>
                                <button onclick="handleBookingInteraction('museum')" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-600/30">
                                    Claim Museum Pass
                                </button>
                            </div>
                        </div>
                    `;
                }

                container.innerHTML = `
                    <section class="relative w-full min-h-[60vh] flex items-center overflow-hidden py-16">
                        <div class="absolute inset-0 z-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" alt="Hotel Hero" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Hotel';" class="w-full h-full object-cover animate-ken-burns">
                            <div class="absolute inset-0 bg-slate-950/50"></div>
                        </div>
                        <div class="relative z-10 w-full px-6 lg:px-12 max-w-7xl mx-auto">
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div class="lg:col-span-12 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-2 border-amber-400 shadow-2xl flex-shrink-0">
                                    <div class="space-y-3 flex-grow">
                                        <h1 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Sarah Jenkins</h1>
                                        <p class="text-amber-300 text-base font-bold drop-shadow">Presidential Suite &bull; Mayfair London &bull; Reservation LON-442 &bull; Check-in: May 14, 2026</p>
                                        <p class="text-slate-200 text-xs sm:text-sm font-medium max-w-xl drop-shadow">Guaranteed Suite Upgrade & 24h Butler Service Attached.</p>
                                        <div class="pt-2">
                                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">
                        <div class="text-center max-w-2xl mx-auto mb-12">
                            <h2 class="text-3xl font-extrabold tracking-tight mb-2">Reservation & Privileges</h2>
                            <p class="text-slate-600 dark:text-slate-300 text-sm font-medium">Your Mayfair London reservation and elite hospitality perks.</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">${hotelGridHtml}</div>
                    </div>
                `;
            } else if (activePartnerView === 'retail') {
                navLogoBtn.className = "w-11 h-11 rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all flex items-center justify-center bg-rose-600 text-white shadow-lg shadow-rose-600/30 focus:outline-none focus:ring-2 focus:ring-rose-500";
                navLogoIcon.className = "fa-solid fa-gem text-base";

                let retailGridHtml = `
                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" alt="Salon" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Salon';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Appointment</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Place Vendome #9942</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Date: May 16, 2026 &bull; Time: 8:00 PM (After-Hours) &bull; Verify appointment pass.</p>
                            <button onclick="isConciergeScreenActive = true; window.scrollTo({top: 0, behavior: 'smooth'}); renderApp();" class="w-full py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2">
                                <i class="fa-solid fa-concierge-bell" aria-hidden="true"></i>
                                <span>Open Salon Check-in</span>
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800" alt="Jewelry" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Jewelry';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">After-Hours Private Salon</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Exclusive boutique closure for unhurried viewing of new timepieces and limited designer collections.</p>
                            <button onclick="handleBookingInteraction('salon')" class="w-full py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30">
                                View Entry Pass
                            </button>
                        </div>
                    </div>

                    <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between group">
                        <div class="h-48 w-full relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800" alt="Champagne" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Champagne';" class="w-full h-full object-cover card-image-motion">
                            <div class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider z-10">Privilege</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">Dom Pérignon Reception</h3>
                            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Vintage champagne served during your private styling session by the master sommelier.</p>
                            <button onclick="handleBookingInteraction('tasting')" class="w-full py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30">
                                View Tasting Voucher
                            </button>
                        </div>
                    </div>
                `;

                if (retailCatalogUnlocked) {
                    retailGridHtml += `
                        <div class="card-box rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 animate-slide-in group">
                            <div class="h-48 w-full relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" alt="Catalog" onerror="this.src='https://placehold.co/800x600/111827/ffffff?text=Catalog';" class="w-full h-full object-cover card-image-motion">
                                <div class="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg z-10">Anniversary Unlocked</div>
                            </div>
                            <div class="p-6">
                                <div class="flex items-center space-x-2 text-rose-500 text-xs font-extrabold uppercase tracking-wider mb-1">
                                    <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
                                    <span>Place Vendôme Vault</span>
                                </div>
                                <h3 class="text-xl font-bold mb-2">Horology Catalog Preview</h3>
                                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">Unlocked via salon verification! Exclusive preview of limited-edition timepieces ready for review.</p>
                                <button onclick="handleBookingInteraction('catalog')" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-rose-600/30">
                                    View Horology Catalog
                                </button>
                            </div>
                        </div>
                    `;
                }

                container.innerHTML = `
                    <section class="relative w-full min-h-[60vh] flex items-center overflow-hidden py-16">
                        <div class="absolute inset-0 z-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" alt="Retail Hero" onerror="this.src='https://placehold.co/2000x1000/090d16/ffffff?text=Retail';" class="w-full h-full object-cover animate-ken-burns">
                            <div class="absolute inset-0 bg-slate-950/50"></div>
                        </div>
                        <div class="relative z-10 w-full px-6 lg:px-12 max-w-7xl mx-auto">
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div class="lg:col-span-12 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah" onerror="this.src='https://placehold.co/400x400/111827/ffffff?text=Sarah';" class="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-2 border-rose-400 shadow-2xl flex-shrink-0">
                                    <div class="space-y-3 flex-grow">
                                        <h1 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Sarah Jenkins</h1>
                                        <p class="text-rose-300 text-base font-bold drop-shadow">Paris Flagship Salon &bull; Place Vendôme &bull; Appt CV-9942 &bull; May 16, 2026 (8:00 PM)</p>
                                        <p class="text-slate-200 text-xs sm:text-sm font-medium max-w-xl drop-shadow">Private After-Hours Closure & Dom Pérignon Tasting Attached.</p>
                                        <div class="pt-2">
                                            <button onclick="handleLogoClick()" title="Return to Aura Dashboard" aria-label="Return to Aura Dashboard" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-aura-500 text-white border border-slate-700 hover:border-aura-500 inline-flex items-center justify-center shadow-xl transition-all">
                                                <i class="fa-solid fa-crown text-base" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div class="w-full px-6 lg:px-12 max-w-7xl mx-auto py-12">
                        <div class="text-center max-w-2xl mx-auto mb-12">
                            <h2 class="text-3xl font-extrabold tracking-tight mb-2">Appointment & Privileges</h2>
                            <p class="text-slate-600 dark:text-slate-300 text-sm font-medium">Your Paris Place Vendôme appointment and elite retail privileges.</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">${retailGridHtml}</div>
                    </div>
                `;
            }
        }

        function openLoginModal() {
            const m = document.getElementById('login-modal');
            const c = document.getElementById('login-modal-content');
            m.classList.remove('hidden');
            setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); c.classList.add('scale-100'); }, 10);
        }

        function closeLoginModal() {
            const m = document.getElementById('login-modal');
            const c = document.getElementById('login-modal-content');
            m.classList.add('opacity-0');
            c.classList.remove('scale-100');
            c.classList.add('scale-95');
            setTimeout(() => m.classList.add('hidden'), 200);
        }

        function handleLoginSubmit(e) {
            e.preventDefault();
            closeLoginModal();
            isLoggedIn = true;
            renderApp();
            showToast('Authentication Successful', 'Welcome back, Sarah Jenkins.');
        }

        function handleLogout() {
            isLoggedIn = false;
            activePartnerView = null;
            isConciergeScreenActive = false;
            aeroSpaUnlocked = false;
            hotelTourUnlocked = false;
            retailCatalogUnlocked = false;
            document.getElementById('push-notification-container').innerHTML = '';
            renderApp();
            showToast('Signed Out', 'You have securely logged out of Aura Platinum.');
        }

        function showToast(title, msg) {
            const t = document.getElementById('toast');
            document.getElementById('toast-title').innerText = title;
            document.getElementById('toast-msg').innerText = msg;
            t.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 4000);
        }
