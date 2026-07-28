// 1. Shrink Popups & Add Scrollbar
var style = document.createElement('style');
style.innerHTML = '.leaflet-popup-content{font-size:9px!important;max-height:98px!important;overflow:auto!important;}';
document.head.appendChild(style);

// 2. Add Logo Image (Top Right)
var logo = document.createElement('img');
logo.src = 'https://github.com/DBx-Environ/MapImages/raw/main/Map.png';
logo.style.cssText = 'position:absolute;top:5px;right:5px;height:140px;background:#fff;padding:3px;z-index:900;pointer-events:none;';
document.body.appendChild(logo);

// 3. Add Home Button (Top Left, under Zoom controls)
var homeBtn = document.createElement('button');
homeBtn.innerHTML = '🏠';
homeBtn.title = 'Reset to County Extent';
homeBtn.style.cssText = 'position:absolute;top:75px;left:10px;z-index:900;background:#fff;border:2px solid rgba(0,0,0,0.2);border-radius:4px;padding:3px 7px;cursor:pointer;font-size:14px;box-shadow:0 1px 5px rgba(0,0,0,0.45);';

// Update these coordinates to your county center and zoom level:
homeBtn.onclick = function() { 
    map.setView([53.2161,-0.2313], 9); 
};
document.body.appendChild(homeBtn);