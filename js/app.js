var initialLocations = [
    {
        name: "Cinque Terre",
        lat: 44.1347938, 
        lng: 9.6807133
    },
    {
        name: "Rome",
        lat: 41.897214, 
        lng: 12.4946613
    },
    {
        name: "Florence",
        lat: 43.7841549, 
        lng: 11.2604063
    }
]

var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.2709639, lng: 11.8606963},
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
});

initialLocations.forEach(function (loc) {
        map.marker = new google.maps.Marker ({
            map: map,
            position: {lat: loc.lat, lng: loc.lng},
            title: this.name
        });
    });

var ViewModel = function () {
	var self = this;

    self.locations = initialLocations;

    self.reCenter = function (loc) {
        map.setCenter({lat: loc.lat, lng: loc.lng});
    }

}

ko.applyBindings(new ViewModel());