let showonmapbuttons = document.querySelectorAll(".displayOnMapButton");

//console.log(showonmapbuttons);

// loop through each button and attach event listeners
// loop through each button and attach event listeners
Array.from(showonmapbuttons).forEach(button => {
    console.log(button);
//    button.addEventListener('click', function() {
//        console.log('showonmap button clicked !!');
//        displaygeojson('json');
//    });
})


function displaygeojson(geojson){
//    console.log('logging displaygeojson')
//    console.log('logging geojson from post : ',geojson);
//    const geojsonobject = JSON.parse(geojson);
//    map.addsource('uploaded-source',{
//        'type':'geojson',
//        'data': geojsonobject
//    });
    console.log('clicked displaygeoJson button !!!');
}
