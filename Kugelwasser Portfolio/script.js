document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    function closeMenu() {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.setAttribute('aria-expanded', 'false');
        mobileMenuBtn?.setAttribute('aria-label', 'Menü öffnen');
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

    async function fetchDiscordStatus() {
        const userId = '832589436977807420';
        const statusIndicator = document.getElementById('discord-status-dot');
        const statusText = document.getElementById('discord-status-text');
        const activityText = document.getElementById('discord-activity');
        const nameElement = document.getElementById('discord-name');
        const metaElement = document.getElementById('discord-meta');
        const avatarElement = document.getElementById('discord-avatar');

        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Lanyard HTTP ${response.status}`);

            const { data } = await response.json();
            if (!data) throw new Error('Keine Presence-Daten erhalten');

            const discordStatus = data.discord_status || 'offline';
            const activities = data.activities || [];
            const customStatus = data.kv?.custom_status;
            const user = data.discord_user;

            statusIndicator.className = `status-dot ${discordStatus}`;
            statusText.textContent = {
                online: 'Online',
                idle: 'Abwesend',
                dnd: 'Bitte nicht stören',
                offline: 'Offline'
            }[discordStatus] || 'Offline';

            if (user?.global_name || user?.username) {
                nameElement.textContent = user.global_name || user.username;
            }

            if (user?.avatar) {
                avatarElement.src = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png?size=256`;
            }

            // Spotify wird von Lanyard separat bereitgestellt.
            if (data.listening_to_spotify && data.spotify) {
                activityText.textContent = `Hört gerade: ${data.spotify.song}`;
                metaElement.textContent = data.spotify.artist || '';
                metaElement.hidden = !metaElement.textContent;
                return;
            }

            // Discord-Aktivitäten: Spiel, Rich Presence etc.
            const currentActivity = activities.find(activity => activity.type !== 4) || activities[0];

            if (currentActivity) {
                const action = currentActivity.type === 0 ? 'Spielt' : 'Macht';
                activityText.textContent = `${action}: ${currentActivity.name}`;

                const details = [currentActivity.details, currentActivity.state]
                    .filter(Boolean)
                    .join(' • ');
                metaElement.textContent = details || customStatus || '';
                metaElement.hidden = !metaElement.textContent;
            } else if (customStatus) {
                activityText.textContent = 'Status';
                metaElement.textContent = customStatus.text || customStatus;
                metaElement.hidden = !metaElement.textContent;
            } else {
                activityText.textContent = 'Keine Aktivität';
                metaElement.textContent = '';
                metaElement.hidden = true;
            }
        } catch (error) {
            console.error('Discord Status konnte nicht geladen werden:', error);
            statusIndicator.className = 'status-dot offline';
            statusText.textContent = 'Offline';
            activityText.textContent = 'Discord-Status momentan nicht verfügbar';
            metaElement.textContent = '';
            metaElement.hidden = true;
        }
    }

    fetchDiscordStatus();
    window.setInterval(fetchDiscordStatus, 15000);
});
