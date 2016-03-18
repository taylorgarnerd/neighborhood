var initialLocations = [
    {
        name: "Vatican City",
        lat: 41.9038243, 
        lng: 12.4476838
    },
    {
        name: "Colosseum - Rome, Italy",
        lat: 41.8902142, 
        lng: 12.4900422
    },
    {
        name: "Spanish Steps - Rome, Italy",
        lat: 41.905994, 
        lng: 12.4805863
    },
    {
        name: "Riccardi Medici Palace - Florence, Italy",
        lat: 43.7751902,
        lng: 11.2535862
    },
    {
        name: "Uffizi Gallery - Florence, Italy",
        lat: 43.7677895,
        lng: 11.2531221
    },
    {
        name: "Galleria dell'Accademia - Florence, Italy",
        lat: 43.7768209,
        lng: 11.2565267
    },
    {
        name: "Monterosso al Mare - Cinque Terre",
        lat: 44.1452226,
        lng: 9.6466341
    },
    {
        name: "Vernazza - Cinque Terre",
        lat: 44.1364165,
        lng: 9.6849488
    },
    {
        name: "Corniglia - Cinque Terre",
        lat: 44.1202756,
        lng: 9.7090253
    },
    {
        name: "Manarola - Cinque Terre",
        lat: 44.1067484,
        lng: 9.7271632
    },
    {
        name: "Riomaggiore - Cinque Terre",
        lat: 44.0996562,
        lng: 9.7365744   
    }
]



var Location = function (data) {
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;

    //Adds a Google Map marker to the object with no associated map
    this.marker = new google.maps.Marker ({
        position: {lat: this.lat, lng: this.lng}
    });
}

var ViewModel = function () {
	var self = this;

    //Bound to the search bar value
    self.search = ko.observable('');

    //Represents the full list of locations. Adds new Location objects from the model
    self.locations = [];
    initialLocations.forEach(function (loc) {
        self.locations.push(new Location(loc));
    });

    //Returns an array of Location objects where self.search is in Location.name
    self.currentLocations = ko.computed(function () {
        return jQuery.grep(self.locations, function(loc, i) {
            return (loc.name.toLowerCase().indexOf(self.search().toLowerCase()) >= 0)
        })
    });

    //Observable that centers the map. Initially set to the first Location's position
    //If null, the streetview div will be hidden
    self.center = ko.observable({lat: self.currentLocations()[0].lat, lng: self.currentLocations()[0].lng})

    //Initializes the Google Map and passes the currentLocations array to it to update markers
    self.map = self.currentLocations;

    //Initializes the Google Maps StreetView and re-centers the map when self.center is changed
    self.streetViewAndCenter = self.center;

    //Displays an alert message that no locations were found when currentLocations is empty
    self.searchAlert = ko.computed(function () {
        return self.currentLocations().length < 1;
    });

    //Bound to clicks on the list div in the UI
    self.reCenter = function (loc) {
        self.center({lat: loc.lat, lng: loc.lng});
    }

    //Updates self.center value when a search is submitted
    self.submit = function() {
        if (self.currentLocations().length <= 0) {
            self.center(null);
        } else {
            self.center({lat: self.currentLocations()[0].lat, lng: self.currentLocations()[0].lng});
        }
    }

}

//Binds Google Map to the map div
ko.bindingHandlers.map = {

    //Initializes the Google Map
    //Adds listener to recenter the map when a marker is clicked
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        viewModel.googleMap = new google.maps.Map(element, {
            center: viewModel.center(),
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false
        });

        viewModel.locations.forEach(function (loc) {
            loc.marker.addListener('click', function () {
                viewModel.center(loc.marker.getPosition());
            })
        });
    },

    //
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var newLocations = ko.utils. unwrapObservable(valueAccessor());
        var map = viewModel.googleMap;

        viewModel.locations.forEach(function (loc) {
            var check = jQuery.inArray(loc, newLocations);

            if (check < 0) {
                loc.marker.setMap(null);
            } else if (loc.marker.getMap() == null) {
                loc.marker.setMap(map);
                loc.marker.setAnimation(google.maps.Animation.DROP);
            }
        });
    }

}

ko.bindingHandlers.streetViewAndCenter = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var center = ko.utils.unwrapObservable(valueAccessor());

        viewModel.googleMap.setCenter(center)

        viewModel.googleMap.setStreetView(new google.maps.StreetViewPanorama(
            element, {
                position: center,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            }));
    }
}

ko.applyBindings(new ViewModel());