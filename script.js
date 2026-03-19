/**
 * Clock App for Digital Signage
 */

let appData = null;

/**
 * Fetch and parse data.json
 */
async function loadAppData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load app data:', error);
    return null;
  }
}

/**
 * Apply settings from data.json to the UI
 */
function applySettings(data) {
    if (!data || !data.sections) return;

    const settings = data.sections.app_settings;
    if (settings) {
        // Apply colors
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', settings.primary_color.value);
        }
        if (settings.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', settings.secondary_color.value);
        }
        if (settings.background_overlay) {
            document.documentElement.style.setProperty('--background-overlay', settings.background_overlay.value);
        }

        // Apply font
        if (settings.font_family) {
            document.documentElement.style.setProperty('--font-family', settings.font_family.value);
        }

        // Apply background image
        if (settings.background_image) {
            const bgImage = document.getElementById('background-image');
            if (bgImage) {
                bgImage.style.backgroundImage = `url(${settings.background_image.value})`;
            }
        }
    }
}

/**
 * Update the clock and date display
 */
function updateClock() {
    if (!appData || !appData.sections) return;

    const clockSettings = appData.sections.clock_settings;
    const now = new Date();

    // Time Formatting
    const timeFormat = clockSettings.time_format.value;
    const showSeconds = clockSettings.show_seconds.value;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (timeFormat === '12h') {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
    } else {
        hours = String(hours).padStart(2, '0');
    }

    let timeString = `${hours}:${minutes}`;
    if (showSeconds) {
        timeString += `:${seconds}`;
    }

    document.getElementById('time').textContent = timeString;
    document.getElementById('ampm').textContent = ampm;
    document.getElementById('ampm').style.display = timeFormat === '12h' ? 'inline' : 'none';

    // Date Formatting
    const dateFormat = clockSettings.date_format.value;
    let dateString = '';

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (dateFormat === 'short') {
        options.weekday = 'short';
        options.month = 'short';
    } else if (dateFormat === 'numeric') {
        options.weekday = undefined;
        return now.toLocaleDateString();
    }

    dateString = now.toLocaleDateString(undefined, options);
    document.getElementById('date').textContent = dateString;
}

/**
 * Initialize the app
 */
async function init() {
    appData = await loadAppData();
    if (appData) {
        applySettings(appData);
        updateClock();

        // Update clock every second
        setInterval(updateClock, 1000);
    } else {
        // Fallback if data loading fails
        setInterval(() => {
            const now = new Date();
            document.getElementById('time').textContent = now.toLocaleTimeString();
            document.getElementById('date').textContent = now.toLocaleDateString();
        }, 1000);
    }
}

// Start the app
window.addEventListener('DOMContentLoaded', init);