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



var Location = function (data) {
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.searched = ko.observable(true);
}

var ViewModel = function () {
	var self = this;
    self.streetview = ko.observable(false);
    self.searchAlert = ko.observable(false);
    self.search = '';

    self.locations = ko.observableArray([]);
    initialLocations.forEach(function (loc) {
        self.locations.push(new Location(loc));
    });

    self.map = self.locations;

    self.reCenter = function (loc) {
        self.streetview(true);
        self.map().googleMap.setCenter({lat: loc.lat, lng: loc.lng});
        self.map().googleMap.setStreetView(new google.maps.StreetViewPanorama(
            document.getElementById('streetview'), {
                position: {lat: loc.lat, lng: loc.lng},
                pov: {
                  heading: 34,
                  pitch: 10
                }
            }));
    }

    self.searchResults = function () {
        var searchVal = self.search.toLowerCase();
        var hits = 0;
        var anyFound = false;

        self.locations().forEach(function (loc) {
            if (loc.name.toLowerCase().indexOf(searchVal) >= 0 || searchVal == '') {
                hits++;
                loc.searched(true);
                if (!anyFound) {
                    self.reCenter(loc);
                    self.searchAlert(false);
                    anyFound = true;
                }
            } else {
                loc.searched(false);
            }

        });
        
        if (hits == 0) {
            self.searchAlert(true);
        }
    }

}

ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapArray = ko.utils.unwrapObservable(valueAccessor());

        mapArray.googleMap = new google.maps.Map(element, {
            center: {lat: 42.6900566, lng: 11.8679232},
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false
        });

        mapArray.forEach(function (loc) {
            mapArray.marker = new google.maps.Marker ({
                map: mapArray.googleMap,
                position: {lat: loc.lat, lng: loc.lng},
                title: loc.name,
                animation: google.maps.Animation.DROP,
            });
        });
    }

}


ko.applyBindings(new ViewModel());