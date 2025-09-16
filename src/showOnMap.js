let showonmapbuttons = document.getElementsByClassName("displayonmapbutton");

// loop through each button and attach event listeners
Array.from(showonmapbuttons).forEach(button => {
    button.addEventlistener('click', function() {
        console.log('showonmap button clicked !!');
        let geojson = button.getattribute('data-geojson');
        displaygeojson(geojson);
    });
})



function displaygeojson(geojson){
    console.log('logging displaygeojson')
    console.log('logging geojson from post : ',geojson);
    const geojsonobject = JSON.parse(geojson);
    map.addsource('uploaded-source',{
        'type':'geojson',
        'data': geojsonobject
    });
    onclickmapdrawer();
}
