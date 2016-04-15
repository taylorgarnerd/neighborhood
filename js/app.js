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
    //Observable for updating formatting when marking a location 'complete'
    this.completed = ko.observable(false);

    //Adds a Google Map marker to the object with no associated map
    this.marker = new google.maps.Marker ({
        position: {lat: this.lat, lng: this.lng}
    });

    //Handles changing the completed observable when a checkmark is clicked
    toggleComplete = function() {
        this.completed(!this.completed());
    }
}

var ViewModel = function () {
	var self = this;

    //Bound to the search bar value
    self.search = ko.observable('');

    //Represents the full list of locations. Adds new Location objects from the model
    self.locations = ko.observableArray();
    initialLocations.forEach(function (loc) {
        self.locations().push(new Location(loc));
    });

    //Observable that centers the map. Initially set to the first Location's position
    //If null, the streetview div will be hidden
    self.center = ko.observable({lat: self.locations()[0].lat, lng: self.locations()[0].lng})

    //Initializes the Google Map and passes the currentLocations array to it to update markers
    self.map = self.locations();

    //Initializes the Google Maps StreetView and re-centers the map when self.center is changed
    self.streetViewAndCenter = self.center;

    //Bound to clicks on the list div in the UI
    self.reCenter = function (loc) {
        self.center({lat: loc.lat, lng: loc.lng});
    }
}

//Binds Google Map to the map div
ko.bindingHandlers.map = {

    //Initializes the Google Map
    //Adds listener to recenter the map when a marker is clicked
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        viewModel.googleMap = new google.maps.Map(element, {
            center: viewModel.center(),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false
        });

        viewModel.locations().forEach(function (loc) {
            loc.marker.addListener('click', function () {
                viewModel.center(loc.marker.getPosition());
            })
        });
    },

    //Sets marker locations as null or the active Google Map when there are changes to currentLocations
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var newLocations = ko.utils.unwrapObservable(valueAccessor()),
            map = viewModel.googleMap;

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

//Initializes Google Maps StreetView
//Changes StreetView center and map center whenever center changes
ko.bindingHandlers.streetViewAndCenter = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var center = ko.utils.unwrapObservable(valueAccessor()),
            map = viewModel.googleMap;

        map.setCenter(center);

        map.setStreetView(new google.maps.StreetViewPanorama(
            element, {
                position: center,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            }));
    }
}

//Initializes
ko.bindingHandlers.placesSearch = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        viewModel.searchBox = new google.maps.places.SearchBox(element);

        var map = viewModel.googleMap,
            searchBox = viewModel.searchBox;
        
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        })

        searchBox.addListener('places_changed', function () {
            console.log('places changedd');
            var places = searchBox.getPlaces();

            if (places.length < 1) {
                console('im returning');
                return;
            }

            var searchLocation = {
                name: places[0].name,
                lat: places[0].geometry.location.lat(),
                lng: places[0].geometry.location.lng()
            };

            console.log(searchLocation);

            viewModel.locations.push(new Location(searchLocation));
            console.log(viewModel.locations().length);

            viewModel.search('');
        });
    }
}

ko.applyBindings(new ViewModel());