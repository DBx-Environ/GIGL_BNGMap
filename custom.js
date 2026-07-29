// 1. Popup CSS & Overlay Rules
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Desktop Logo (240px) */
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
  }

  /* Home Button */
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
    pointer-events: auto !important; /* Critical to ensure button remains clickable in UI layer */
  }

  /* Mobile Adjustment (Screens under 768px) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      height: 90px !important; /* Exact mobile height requested */
    }
  }
`;
document.head.appendChild(style);

// 2. Attach elements safely to the Leaflet UI layer
function attachOverlays() {
    // Target Leaflet's dedicated UI container instead of the base #map div
    var uiContainer = document.querySelector('.leaflet-control-container');
    
    // If Leaflet hasn't built the UI yet, wait 50ms and try again
    if (!uiContainer) {
        setTimeout(attachOverlays, 50);
        return;
    }

    // Attach Logo
    if (!document.getElementById('custom-map-logo')) {
        var logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        logo.src = 'Map.png';
        uiContainer.appendChild(logo);
    }

    // Attach Home Button
    if (!document.getElementById('custom-home-btn')) {
        var homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';

        homeBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation(); // Stops accidental map clicks behind the button
            }
            if (typeof map !== 'undefined') {
                map.setView([53.1, 0], 8.6);
            }
        };
        uiContainer.appendChild(homeBtn);
    }
}

// Run immediately
attachOverlays();