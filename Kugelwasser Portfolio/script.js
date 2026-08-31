document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    function closeMenu() {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Menü öffnen');
    }

    mobileMenuBtn?.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
        mobileMenuBtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

    const header = document.querySelector('.site-header');
    const updateHeader = () => {
        header.style.borderBottomColor = window.scrollY > 20 ? 'rgba(255,255,255,.08)' : 'transparent';
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const DISCORD_USER_ID = '832589436977807420';
    const statusDot = document.getElementById('discord-status-dot');
    const statusText = document.getElementById('discord-status-text');
    const nameEl = document.getElementById('discord-name');
    const activityEl = document.getElementById('discord-activity');
    const metaEl = document.getElementById('discord-meta');
    const avatarEl = document.getElementById('discord-avatar');

    const statusColors = {
        online: '#43b581',
        idle: '#faa61a',
        dnd: '#f04747',
        offline: '#747f8d'
    };

    const statusLabels = {
        online: 'Online',
        idle: 'Abwesend',
        dnd: 'Bitte nicht stören',
        offline: 'Offline'
    };

    function setStatusVisual(state) {
        const normalized = statusColors[state] ? state : 'offline';
        statusDot.style.backgroundColor = statusColors[normalized];
        statusText.textContent = statusLabels[normalized];
    }

    function getActivity(data) {
        const activities = data.activities || [];

        if (data.listening_to_spotify && data.spotify) {
            return {
                text: `Hört gerade ${data.spotify.song} – ${data.spotify.artist}`,
                meta: data.spotify.album || ''
            };
        }

        const active = activities.find(activity => activity.type !== 4) || activities[0];
        if (!active) {
            return { text: 'Aktuell keine aktive Discord-Activity.', meta: '' };
        }

        const details = active.details || '';
        const state = active.state || '';
        return {
            text: [details, state].filter(Boolean).join(' • ') || `Aktiv: ${active.name || 'Discord'}`,
            meta: active.assets?.large_text || active.name || ''
        };
    }

    async function loadDiscordPresence() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const payload = await response.json();
            if (!payload.success || !payload.data) throw new Error('Keine Discord-Daten verfügbar');

            const userData = payload.data;
            const user = userData.discord_user;
            const activity = getActivity(userData);

            if (user?.avatar) {
                avatarEl.src = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.avatar}.png?size=256`;
            }

            nameEl.textContent = user?.global_name || user?.username || 'Kugelwasser';
            setStatusVisual(userData.discord_status || 'offline');
            activityEl.textContent = activity.text;
            metaEl.textContent = activity.meta;
            metaEl.hidden = !activity.meta;
        } catch (error) {
            console.warn('Discord presence unavailable:', error);
            setStatusVisual('offline');
            nameEl.textContent = 'Kugelwasser';
            activityEl.textContent = 'Discord-Status konnte gerade nicht geladen werden.';
            metaEl.textContent = '';
            metaEl.hidden = true;
        }
    }

    loadDiscordPresence();
    window.setInterval(loadDiscordPresence, 15000);
});
