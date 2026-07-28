// 1. Popup CSS & Base Overlay Styles
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* PC Desktop Logo: 240px Height */
  #custom-map-logo {
    position: fixed !important;
    height: 240px !important;
    width: auto !important;
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    z-index: 99999 !important;
    pointer-events: none !important;
  }

  /* Fixed Home Button */
  #custom-home-btn {
    position: fixed !important;
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

  /* Mobile Phone Logo: 120px Height */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      height: 120px !important;
    }
  }
`;
document.head.appendChild(style);

// 2. Attach Elements directly to body (The Mobile-Working Method)
var logo = document.createElement('img');
logo.id = 'custom-map-logo';
logo.src = 'Map.png';
document.body.appendChild(logo);

var homeBtn = document.createElement('button');
homeBtn.id = 'custom-home-btn';
homeBtn.title = 'Reset to County Extent';
homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';

homeBtn.onclick = function(e) {
    if (e) e.preventDefault();
    if (typeof map !== 'undefined') {
        map.setView([53.005, -0.75], 8.6);
    }
};
document.body.appendChild(homeBtn);

// 3. Dynamically Snap Elements to the #map Container on Screen
function alignOverlaysToMap() {
    var mapEl = document.getElementById('map') || document.body;
    var rect = mapEl.getBoundingClientRect();

    // Snap Logo 10px inside the top-right corner of the map canvas
    logo.style.top = (rect.top + 10) + 'px';
    logo.style.right = (window.innerWidth - rect.right + 10) + 'px';

    // Snap Home Button 165px down on the left side of the map canvas
    homeBtn.style.top = (rect.top + 165) + 'px';
    homeBtn.style.left = (rect.left + 10) + 'px';
}

// Keep positions perfectly locked during window resizes and page scrolls
window.addEventListener('resize', alignOverlaysToMap);
window.addEventListener('scroll', alignOverlaysToMap);
setInterval(alignOverlaysToMap, 200);