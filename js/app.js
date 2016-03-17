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
    self.locations = ko.observableArray([]);
    initialLocations.forEach(function (loc) {
        self.locations.push(new Location(loc));
    });

    self.currentLocations = ko.computed(function () {
        return jQuery.grep(self.locations(), function(loc, i) {
            return (loc.name.toLowerCase().indexOf(self.search().toLowerCase()) >= 0)
        })
    });

    self.center = ko.observable({lat: self.currentLocations()[0].lat, lng: self.currentLocations()[0].lng})

    self.map = self.currentLocations;

    self.streetViewAndCenter = self.center;

    self.searchAlert = ko.computed(function () {
        return self.currentLocations().length < 1;
    });

    self.reCenter = function (loc) {
        self.center({lat: loc.lat, lng: loc.lng});
    }

    //Suppresses the default action for Submit on the form containing the search bar
    self.submit = function() {
        if (self.currentLocations().length <= 0) {
            self.center(null);
        } else {
            self.center({lat: self.currentLocations()[0].lat, lng: self.currentLocations()[0].lng});
        }
    }

}

ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        viewModel.googleMap = new google.maps.Map(element, {
            center: viewModel.center(),
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false
        });

    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var newLocations = ko.utils. unwrapObservable(valueAccessor());
        var map = viewModel.googleMap;

        viewModel.locations().forEach(function (loc) {
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