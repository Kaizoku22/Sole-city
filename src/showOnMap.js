function attachShowOnMapListeners(scope=document){
    let showonmapbuttons = document.querySelectorAll(".displayOnMapButton");
//    console.log('LOGGING buttons array: ',showonmapbuttons);
    Array.from(showonmapbuttons).forEach((button) => {
//        console.log(button);
        if(!button.dataset.listenerAttached){
            button.addEventListener('click',function(){
                displayOnMap(button.dataset.geojson);
            });
        }
        button.dataset.listenerAttached = "true";
    });
}


    function displayOnMap(geojson){
        console.log('logging geojson from post : ',geojson);
        const geojsonobject = JSON.parse(geojson);
        const cords = geojsonobject.features[0].geometry.coordinates;
        const lang = cords[0] ;
        const lat = cords[1];
        console.log(`lang:${lang} lat:${lat}`)
        if(map.getSource('post-source')){
            map.removeSource('post-source');
        }
        map.addSource('post-source',{
            'type':'geojson',
            'data': geojsonobject
        });
        map.addLayer({
            id:'post-source-layer',
            type:'circle',
            source:'post-source',
            paint:{
                'circle-radius':8,
                'circle-color':'#ff9800'
            }
        });
        onClickMapDrawer(true);
        map.flyTo({
            center:[lang,lat],
            essential:true,
            zoom:14,
            offset:[400,200]
        });
    }


document.addEventListener('DOMContentLoaded',function(){
    attachShowOnMapListeners();
});

document.addEventListener('htmx:afterSwap',function(evt){
    const requestPath = evt.detail.requestConfig.path;
//    console.log('LOGGING path in afterSwap:',requestPath);
    if(requestPath === '/trailwall'){
//        console.log('LOGGING HTMX afterSwap detail.xhr',evt.detail.requestConfig.path);
        attachShowOnMapListeners();
    }

});

