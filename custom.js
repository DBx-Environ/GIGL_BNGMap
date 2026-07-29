// 1. Popup CSS & Responsive Overlay Rules
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Base Styles for Logo */
  #custom-map-logo {
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    z-index: 99999 !important;
    pointer-events: none !important;
  }

  /* Base Styles for Home Button */
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
      position: absolute !important;
      top: 10px !important;
      left: 10px !important; /* Top Left */
      height: 240px !important;
      width: auto !important;
    }
    #custom-home-btn {
      position: absolute !important;
      top: 175px !important; 
      right: 10px !important; /* Top Right */
    }
  }

  /* MOBILE RULES (768px and under) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      position: fixed !important; 
      top: 10px !important;
      left: 10px !important; /* Top Left */
      height: 180px !important; /* 180px scale */
      width: auto !important;
    }
    #custom-home-btn {
      position: fixed !important; 
      top: 175px !important; 
      right: 10px !important; /* Top Right */
    }
  }

  /* --- THE CSS FLIP: Safely swap Leaflet corners without breaking mobile scripts --- */
  
  /* 1. Visually force the Top-Left container to the right side */
  .leaflet-top.leaflet-left {
    left: auto !important;
    right: 0px !important;
    z-index: 9999 !important; 
  }
  /* Fix the alignment of items inside it so they hug the right wall */
  .leaflet-top.leaflet-left .leaflet-control {
    float: right !important;
    clear: both !important;
    margin-right: 10px !important;
    margin-left: 0 !important;
  }

  /* 2. Move the original Top-Right container to the left side (prevents overlap) */
  .leaflet-top.leaflet-right {
    right: auto !important;
    left: 0px !important;
    top: 260px !important; /* Pushed down safely below your custom logo */
  }
  /* Fix alignment for any layers/controls that were in the top right */
  .leaflet-top.leaflet-right .leaflet-control {
    float: left !important;
    clear: both !important;
    margin-left: 10px !important;
    margin-right: 0 !important;
  }
`;
document.head.appendChild(style);

// 2. Dynamic Placement Logic
function setupResponsiveOverlays() {
    // Create Logo
    var logo = document.getElementById('custom-map-logo');
    if (!logo) {
        logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        logo.src = 'Map.png';
    }

    // Create Home Button
    var homeBtn = document.getElementById('custom-home-btn');
    if (!homeBtn) {
        homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
        
        homeBtn.onclick = function(e) {
            if (e) e.preventDefault();
            if (typeof map !== 'undefined') {
                map.setView([53.1, 0], 8.6); 
            }
        };
    }

    // Decide where to attach our custom elements based on screen size
    var isMobile = window.innerWidth <= 768;
    var mapBox = document.getElementById('map');

    if (isMobile) {
        document.body.appendChild(logo);
        document.body.appendChild(homeBtn);
    } else {
        if (!mapBox) {
            setTimeout(setupResponsiveOverlays, 50); 
            return;
        }
        mapBox.style.position = 'relative'; 
        mapBox.appendChild(logo);
        mapBox.appendChild(homeBtn);
    }
}

// Run immediately
setupResponsiveOverlays();

// 3. Listen for screen resizing (e.g., rotating a tablet)
window.addEventListener('resize', function() {
    var isMobile = window.innerWidth <= 768;
    var logo = document.getElementById('custom-map-logo');
    var homeBtn = document.getElementById('custom-home-btn');
    var mapBox = document.getElementById('map');

    if (logo && homeBtn) {
        if (isMobile && logo.parentElement !== document.body) {
            document.body.appendChild(logo);
            document.body.appendChild(homeBtn);
        } else if (!isMobile && mapBox && logo.parentElement !== mapBox) {
            mapBox.appendChild(logo);
            mapBox.appendChild(homeBtn);
        }
    }
});