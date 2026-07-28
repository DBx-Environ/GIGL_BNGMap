// 1. Popup CSS & Desktop/Mobile Logo Rules
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }
  
  /* Desktop Logo: Locked at 240px */
  .map-custom-logo {
    height: 240px !important;
    width: auto !important;
    background: #fff;
    padding: 3px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4);
    border-radius: 4px;
    display: block;
  }

  /* Mobile Screens (Under 768px wide) */
  @media screen and (max-width: 768px) {
    .map-custom-logo {
      height: 100px !important;
    }
  }
`;
document.head.appendChild(style);

// 2. Attach Custom Elements to Map
function initCustomMapElements() {
    if (typeof map === 'undefined' || typeof L === 'undefined') {
        setTimeout(initCustomMapElements, 100);
        return;
    }

    if (window._customMapInjected) return;
    window._customMapInjected = true;

    // Logo Control (Top Right)
    var LogoControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
            var container = L.DomUtil.create('div');
            container.innerHTML = '<img src="https://raw.githubusercontent.com/DBx-Environ/MapImages/main/Map.png" class="map-custom-logo">';
            return container;
        }
    });
    map.addControl(new LogoControl());

    // Home Button Control (Top Left)
    var HomeControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
            var container = L.DomUtil.create('div', 'leaflet-bar');
            var btn = L.DomUtil.create('a', '', container);
            btn.href = '#';
            btn.title = 'Reset to County Extent';
            btn.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#fff;cursor:pointer;';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
            
            L.DomEvent.disableClickPropagation(btn);
            L.DomEvent.on(btn, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                map.setView([53.2005, -0.2530], 8.6);
            });
            return container;
        }
    });
    map.addControl(new HomeControl());
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initCustomMapElements();
} else {
    document.addEventListener('DOMContentLoaded', initCustomMapElements);
}