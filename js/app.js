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
    center: {lat: initialLocations[0].lat, lng: initialLocations[0].lng},
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

    self.locations = ko.observableArray(initialLocations);

    self.reCenter = function (loc) {
        map.setCenter({lat: loc.lat, lng: loc.lng});
        map.setStreetView(new google.maps.StreetViewPanorama(
            document.getElementById('streetview'), {
                position: {lat: loc.lat, lng: loc.lng},
                pov: {
                  heading: 34,
                  pitch: 10
                }
            }));
    }

    self.streetView = function (loc) {
        map.setStreetView(new google.maps.StreetViewPanorama(
            document.getElementById('streetview'), {
                position: {lat: loc.lat, lng: loc.lng},
                pov: {
                  heading: 34,
                  pitch: 10
                }
            }));
    }

}

ko.applyBindings(new ViewModel());