// 1. Inject Styles (240px on Desktop, 110px on Mobile)
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Desktop Logo: Locked at 240px */
  #custom-map-logo {
    height: 240px;
    width: auto;
    display: block;
    background: #ffffff;
    padding: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    border-radius: 4px;
  }

  /* Mobile Screens (Under 768px wide) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      height: 110px !important;
    }
  }
`;
document.head.appendChild(style);

// 2. Inject Elements into Leaflet's Native Top Layer
function injectLeafletControls() {
    var topRight = document.querySelector('.leaflet-top.leaflet-right');
    var topLeft = document.querySelector('.leaflet-top.leaflet-left');

    // If Leaflet hasn't built its control containers yet, try again in 50ms
    if (!topRight || !topLeft) {
        setTimeout(injectLeafletControls, 50);
        return;
    }

    // --- Inject Logo (Top Right) ---
    if (!document.getElementById('custom-map-logo')) {
        var logoContainer = document.createElement('div');
        logoContainer.className = 'leaflet-control';
        logoContainer.style.cssText = 'margin: 10px; pointer-events: auto;';
        logoContainer.innerHTML = '<img id="custom-map-logo" src="https://raw.githubusercontent.com/DBx-Environ/MapImages/main/Map.png">';
        topRight.appendChild(logoContainer);
    }

    // --- Inject Home Button (Top Left - Stacks under existing controls) ---
    if (!document.getElementById('custom-home-btn')) {
        var homeContainer = document.createElement('div');
        homeContainer.className = 'leaflet-control leaflet-bar';
        homeContainer.style.cssText = 'pointer-events: auto;';
        
        var homeBtn = document.createElement('a');
        homeBtn.id = 'custom-home-btn';
        homeBtn.href = '#';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#fff;cursor:pointer;';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';

        function doReset(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (typeof map !== 'undefined' && map.setView) {
                map.setView([53.005, -0.530], 8.6);
            }
        }

        homeBtn.onclick = doReset;
        homeBtn.ontouchstart = doReset;
        
        homeContainer.appendChild(homeBtn);
        topLeft.appendChild(homeContainer);
    }
}

// Start polling for Leaflet controls
injectLeafletControls();