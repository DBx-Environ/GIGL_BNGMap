// 1. Popup CSS & Styling Rules
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Desktop Logo - Let Leaflet handle the position, we just handle the look */
  #custom-map-logo {
    height: 240px !important;
    width: auto !important;
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    pointer-events: none !important;
    margin: 10px !important; 
  }

  /* Home Button */
  #custom-home-btn {
    width: 36px !important;
    height: 36px !important;
    background: #ffffff !important;
    border: 2px solid rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    padding: 0 !important;
    margin: 10px !important;
    pointer-events: auto !important;
  }

  /* Mobile Adjustment (Screens under 768px) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      height: 120px !important; /* Scaled to 120px */
    }
  }
`;
document.head.appendChild(style);

// 2. Native Leaflet Control Injection
function addLeafletControls() {
    // Wait until the Leaflet 'map' variable and 'L' library are fully loaded by qgis2web
    if (typeof map === 'undefined' || typeof L === 'undefined') {
        setTimeout(addLeafletControls, 100);
        return;
    }

    // Create Logo Control and assign to Top Right
    if (!document.getElementById('custom-map-logo')) {
        var LogoControl = L.Control.extend({
            options: { position: 'topright' },
            onAdd: function () {
                var img = L.DomUtil.create('img');
                img.id = 'custom-map-logo';
                img.src = 'Map.png';
                return img;
            }
        });
        map.addControl(new LogoControl());
    }

    // Create Home Button Control and assign to Top Left
    if (!document.getElementById('custom-home-btn')) {
        var HomeControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: function () {
                var btn = L.DomUtil.create('button');
                btn.id = 'custom-home-btn';
                btn.title = 'Reset to County Extent';
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
                
                // Use Leaflet's native event blocker to stop clicks hitting the map behind it
                btn.onclick = function(e) {
                    L.DomEvent.stopPropagation(e);
                    map.setView([53.2005, -0.2530], 8.6);
                };
                return btn;
            }
        });
        map.addControl(new HomeControl());
    }
}

// Run the script
addLeafletControls();