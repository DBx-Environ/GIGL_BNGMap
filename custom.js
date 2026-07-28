// 1. Shrink Popups & Add Scrollbar (Matching your 98px height)
var style = document.createElement('style');
style.innerHTML = '.leaflet-popup-content{font-size:9px!important;max-height:98px!important;overflow:auto!important;}';
document.head.appendChild(style);

// Wait for map container to load, then attach overlays directly inside #map
window.addEventListener('DOMContentLoaded', function() {
    var mapContainer = document.getElementById('map') || document.body;

    // 2. Add Logo Image (Top Right inside Map, 240px height)
    var logo = document.createElement('img');
    logo.src = 'https://github.com/DBx-Environ/MapImages/raw/main/Map.png';
    logo.style.cssText = 'position:absolute;top:5px;right:5px;height:240px;background:#fff;padding:3px;z-index:2000;pointer-events:none;';
    mapContainer.appendChild(logo);

    // 3. Add Home Button (Top Left under Zoom Controls)
    var homeBtn = document.createElement('button');
    homeBtn.innerHTML = '🏠';
    homeBtn.title = 'Reset to County Extent';
    homeBtn.style.cssText = 'position:absolute;top:75px;left:10px;z-index:2000;background:#fff;border:2px solid rgba(0,0,0,0.2);border-radius:4px;padding:3px 7px;cursor:pointer;font-size:14px;box-shadow:0 1px 5px rgba(0,0,0,0.45);';

    homeBtn.onclick = function() { 
        if (typeof map !== 'undefined') {
            map.setView([53.2005, -0.2530], 8.6); 
        }
    };
    mapContainer.appendChild(homeBtn);
});