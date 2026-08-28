document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    const DISCORD_USER_ID = '832589436977807420';
    const statusDot = document.getElementById('discord-status-dot');
    const statusText = document.getElementById('discord-status-text');
    const nameEl = document.getElementById('discord-name');
    const activityEl = document.getElementById('discord-activity');
    const metaEl = document.getElementById('discord-meta');
    const avatarEl = document.getElementById('discord-avatar');

    function setStatusVisual(state) {
        const colorMap = {
            online: '#43b581',
            idle: '#faa61a',
            dnd: '#f04747',
            offline: '#747f8d'
        };

        const labelMap = {
            online: 'Online',
            idle: 'Abwesend',
            dnd: 'Bitte nicht stören',
            offline: 'Offline'
        };

        statusDot.style.background = colorMap[state] || colorMap.offline;
        statusText.textContent = labelMap[state] || 'Offline';
    }

    function createActivityText(data) {
        const activities = data.activities || [];

        if (data.listening_to_spotify) {
            const track = data.spotify;
            return {
                title: 'Hört gerade Spotify',
                text: `${track.song} – ${track.artist}`,
                meta: `${track.album}`
            };
        }

        const activeActivity = activities.find(activity => activity.type !== 4) || activities[0];

        if (!activeActivity) {
            return {
                title: 'Keine aktive Discord-Activity',
                text: 'Aktuell nicht auf Discord aktiv.',
                meta: ''
            };
        }

        const name = activeActivity.name || 'Discord';
        const details = activeActivity.details || '';
        const state = activeActivity.state || '';
        const largeText = activeActivity.assets?.large_text || '';

        return {
            title: `Aktiv: ${name}`,
            text: [details, state].filter(Boolean).join(' • ') || 'Aktiv auf Discord',
            meta: largeText || ''
        };
    }

    async function loadDiscordPresence() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const data = await response.json();

            if (!data.success || !data.data) {
                throw new Error('Keine Discord-Daten verfügbar');
            }

            const userData = data.data;
            const user = userData.discord_user;
            const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/832589436977807420/fcc756c6bab07bbcfa8b769291e1f66b?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

            avatarEl.src = avatarUrl;
            nameEl.textContent = user.username || 'Kugelwasser';
            setStatusVisual(userData.discord_status || 'offline');

            const activity = createActivityText(userData);
            activityEl.textContent = activity.text;
            metaEl.textContent = activity.meta;

            if (activity.meta) {
                metaEl.classList.add('visible');
            } else {
                metaEl.classList.remove('visible');
            }
        } catch (error) {
            console.error('Discord status fetch failed:', error);
            setStatusVisual('offline');
            nameEl.textContent = 'Kugelwasser';
            activityEl.textContent = 'Discord-Status konnte nicht geladen werden.';
            metaEl.textContent = 'Bitte später erneut versuchen';
            metaEl.classList.add('visible');
        }
    }

    loadDiscordPresence();
    setInterval(loadDiscordPresence, 15000);

    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        } else {
            header.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    });
});