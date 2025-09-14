// mapComponent.js
function initMapComponent() {
            let addingLocation = false;        
            let Userlocation;
             fetch('http://ip-api.com/json/?fields=61439')
                .then((res)=> res.json())
                .then((res)=>{ Userlocation = res; console.log(res.lat)});
             console.log('userLocation: ',Userlocation); 

            function updatFormLocationInput(lang,lat){
                        let formTrailLocationInput = document.getElementById('trail-location');
                        const cords = [lang,lat];
                        console.log('array of coordinates:',cords);
                        const geoJson = {
                            "type":"FeatureCollection",
                            "features": [{
                                "type":"Feature",
                                "properties":{},
                                "geometry":{
                                    "coordinates":cords,
                                    "type":"Point"
                                    }  
                                }]

                            }
                        console.log('geoJson created : ',geoJson);
                        formTrailLocationInput.value = JSON.stringify(geoJson);
                }
             var map = new maplibregl.Map({
              container: 'map',
              style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=I6spCmeih56SEqbVqt8w', // stylesheet location
              center: [72.89, 19.03], // starting position [lng, lat]
              zoom: 10 // starting zoom
                });  
                let marker = new maplibregl.Marker()
                  .setLngLat([72.89, 19.03])
                  .addTo(map); 
                map.on('click',(event)=>{
                    if(addingLocation){
                        let trailLocation = new maplibregl.Marker({draggable:true})
                        .setLngLat([event.lngLat.lng,event.lngLat.lat])
                        .addTo(map);
                        updatFormLocationInput(event.lngLat.lng,event.lngLat.lat);
                        trailLocation.on('dragend', onDragEnd);
                        addingLocation = false;
                        function onDragEnd() {
                            const lngLat = trailLocation.getLngLat();
                            console.log('Updated location : ',lngLat);
                            updatFormLocationInput(lngLat.lng,lngLat.lat);
                            }
                        }
                    console.log('On-Map-Click event has occured:',event.lngLat);
                    });
            function onAddLocationClicked(){
                onClickMapDrawer();
                if(addingLocation){
                    addingLocation = false;
                    }else{addingLocation = true;}
                }
}

