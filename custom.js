// 1. Ensure Viewport Meta Tag exists (Crucial for mobile Media Queries to fire)
if (!document.querySelector('meta[name="viewport"]')) {
    var meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(meta);
}

// 2. CSS Rules for PC & Mobile
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Desktop Logo: Locked inside top-right of map at 240px */
  #custom-map-logo {
    position: absolute !important;
    top: 10px !important;
    right: 10px !important;
    height: 240px !important;
    width: auto !important;
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    z-index: 99999 !important;
    pointer-events: none !important;
    /* Adding transition makes the resize smooth if a user resizes their desktop browser */
    transition: height 0.3s ease; 
  }

  /* Home Button: Locked inside top-left of map */
  #custom-home-btn {
    position: absolute !important;
    top: 165px !important;
    left: 10px !important;
    width: 36px !important;
    height: 36px !important;
    background: #ffffff !important;
    border: 2px solid rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    padding: 0 !important;
    touch-action: manipulation !important;
  }

  /* Mobile Screens: Scale logo down to 120px */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      height: 120px !important;
    }
  }
`;
document.head.appendChild(style);

// 3. Attach Elements Inside the Map Container
function setupMapOverlays() {
    var mapBox = document.getElementById('map') || document.body;

    // Ensure map box allows absolute positioning
    if (mapBox && mapBox !== document.body) {
        mapBox.style.position = 'relative';
    } else if (!document.getElementById('map')) {
        setTimeout(setupMapOverlays, 50);
        return;
    }

    // Attach Logo
    if (!document.getElementById('custom-map-logo')) {
        var logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        // Note: Your prompt mentioned logo.png but the code uses Map.png. Update this URL if needed.
        logo.src = 'https://raw.githubusercontent.com/DBx-Environ/MapImages/main/Map.png';
        
        // Safety fix: nullify onerror before assigning fallback to prevent infinite loops
        logo.onerror = function() { 
            this.onerror = null; 
            this.src = 'logo.png'; 
        };
        mapBox.appendChild(logo);
    }

    // Attach Home Button
    if (!document.getElementById('custom-home-btn')) {
        var homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';

        function resetView(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation(); // Prevents map clicks passing through the button
            }
            if (typeof map !== 'undefined' && map.setView) {
                map.setView([53.0, 0.5], 8.6);
            }
        }

        homeBtn.onclick = resetView;
        homeBtn.ontouchstart = resetView;
        mapBox.appendChild(homeBtn);
    }
}

// Run immediately
setupMapOverlays();