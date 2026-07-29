// 1. Popup CSS & Responsive Overlay Rules
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Base Styles for Custom Logo */
  #custom-map-logo {
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    z-index: 99999 !important;
    pointer-events: none !important;
  }

  /* Base Styles for Custom Home Button */
  #custom-home-btn {
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
  }

  /* DESKTOP RULES (Above 768px) */
  @media screen and (min-width: 769px) {
    #custom-map-logo {
      position: absolute !important; /* Locks safely inside map container */
      top: 10px !important;
      right: 10px !important; /* Top Right */
      height: 240px !important; /* Fixed Desktop Logo (240px) */ /*[cite: 2] */
      width: auto !important;
    }
    #custom-home-btn {
      position: absolute !important;
      top: 175px !important; /* Pushed down to clear the 3px overlap */
      left: 12px !important; /* Shifted right by 3px to align flush with magnifying glass */
    }
  }

  /* MOBILE RULES (768px and under) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      position: fixed !important; /* Bypasses mobile map container limits */ /*[cite: 2] */
      top: 10px !important;
      right: 10px !important; /* Top Right */
      height: 180px !important; /* Mobile Adjustment */ /*[cite: 2] */
      width: auto !important;
    }
    #custom-home-btn {
      position: fixed !important; /*[cite: 2] */
      top: 175px !important; 
      left: 15px !important; 
    }
  }
`;
document.head.appendChild(style);

// 2. Attach Elements (Your proven method)
function attachOverlays() {
    var isMobile = window.innerWidth <= 768;
    var mapBox = document.getElementById('map');

    // Create Logo
    var logo = document.getElementById('custom-map-logo');
    if (!logo) {
        logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        logo.src = 'Map.png'; /*[cite: 2] */
    }

    // Create Home Button
    var homeBtn = document.getElementById('custom-home-btn');
    if (!homeBtn) {
        homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'; /*[cite: 2] */
        
        homeBtn.onclick = function(e) {
            if (e) e.preventDefault(); /*[cite: 2] */
            if (typeof map !== 'undefined') {
                map.setView([53.1, 0], 8.6); /*[cite: 2] */
            }
        };
    }

    // Attach dynamically based on screen size
    if (isMobile) {
        // Mobile attaches to document body /*[cite: 2] */
        document.body.appendChild(logo); 
        document.body.appendChild(homeBtn); 
    } else {
        // Desktop attaches to map container
        if (!mapBox) {
            setTimeout(attachOverlays, 50);
            return;
        }
        mapBox.style.position = 'relative';
        mapBox.appendChild(logo);
        mapBox.appendChild(homeBtn);
    }
}

// Run immediately
attachOverlays();

// 3. Listen for screen resizing to instantly snap them to the right layer
window.addEventListener('resize', attachOverlays);