// 1. Shrink Popups & Add Responsive Logo Styles
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }
  .map-custom-logo {
    position: absolute;
    top: 5px;
    right: 5px;
    height: 240px;
    width: auto;
    background: #fff;
    padding: 3px;
    z-index: 2000;
    pointer-events: none;
    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
  }
  /* Mobile Phone Adjustments (Screens under 600px wide) */
  @media (max-width: 600px) {
    .map-custom-logo {
      height: 80px !important;
      max-width: 140px !important;
    }
  }
`;
document.head.appendChild(style);

// Wait for map container to load, then attach overlays
window.addEventListener('DOMContentLoaded', function() {
    var mapContainer = document.getElementById('map') || document.body;

    // 2. Add Direct-URL Logo (No HTTP Redirects)
    var logo = document.createElement('img');
    logo.className = 'map-custom-logo';
    logo.src = 'https://raw.githubusercontent.com/DBx-Environ/MapImages/main/Map.png';
    mapContainer.appendChild(logo);

    // 3. Add Home Button (36px x 36px, positioned at top: 165px)
    var homeBtn = document.createElement('button');
    homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
    homeBtn.title = 'Reset to County Extent';
    homeBtn.style.cssText = 'position:absolute;top:165px;left:10px;z-index:2000;background:#fff;border:2px solid rgba(0,0,0,0.2);border-radius:4px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,0.45);padding:0;';

    homeBtn.onclick = function() { 
        if (typeof map !== 'undefined') {
            map.setView([53.2005, -0.2530], 8.6); 
        }
    };
    mapContainer.appendChild(homeBtn);
});