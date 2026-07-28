// 1. Shrink Popups & Add Responsive Logo Styling
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }
  .map-custom-logo {
    height: 180px;
    width: auto;
    background: #fff;
    padding: 3px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4);
    border-radius: 4px;
    display: block;
  }
  @media (max-width: 600px) {
    .map-custom-logo {
      height: 75px !important;
      max-width: 120px !important;
    }
  }
`;
document.head.appendChild(style);

// 2. Register Native Leaflet Controls when the page loads
window.addEventListener('load', function() {
    if (typeof map === 'undefined') return;

    // --- Add Logo to Leaflet Top-Right Box ---
    var LogoControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
            var container = L.DomUtil.create('div');
            container.innerHTML = '<img src="https://raw.githubusercontent.com/DBx-Environ/MapImages/main/Map.png" class="map-custom-logo">';
            return container;
        }
    });
    map.addControl(new LogoControl());

    // --- Add Home Button to Leaflet Top-Left Box ---
    var HomeControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
            var container = L.DomUtil.create('div', 'leaflet-bar');
            var btn = L.DomUtil.create('a', '', container);
            btn.href = '#';
            btn.title = 'Reset to County Extent';
            btn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#fff;cursor:pointer;';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
            
            // Prevent mobile map drag when clicking button
            L.DomEvent.disableClickPropagation(btn);
            L.DomEvent.on(btn, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                map.setView([53.2005, -0.2530], 8.6);
            });
            return container;
        }
    });
    map.addControl(new HomeControl());
});