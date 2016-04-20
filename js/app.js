var initialLocations = [
    {
        name: "Vatican City",
        lat: 41.9038243, 
        lng: 12.4476838
    },
    {
        name: "Colosseum",
        lat: 41.8902142, 
        lng: 12.4900422
    },
    {
        name: "Spanish Steps",
        lat: 41.905994, 
        lng: 12.4805863
    },
    {
        name: "Palazzo Medici Riccardi",
        lat: 43.7751902,
        lng: 11.2535862
    },
    {
        name: "Uffizi Gallery",
        lat: 43.7677895,
        lng: 11.2531221
    },
    {
        name: "Galleria dell'Accademia",
        lat: 43.7768209,
        lng: 11.2565267
    },
    {
        name: "Monterosso al Mare",
        lat: 44.1452226,
        lng: 9.6466341
    },
    {
        name: "Vernazza",
        lat: 44.1364165,
        lng: 9.6849488
    },
    {
        name: "Corniglia",
        lat: 44.1202756,
        lng: 9.7090253
    },
    {
        name: "Manarola",
        lat: 44.1067484,
        lng: 9.7271632
    },
    {
        name: "Riomaggiore",
        lat: 44.0996562,
        lng: 9.7365744   
    }
]



var Location = function (data, callback) {
    var self = this;
    self.name = data.name;
    self.lat = data.lat;
    self.lng = data.lng;
    //Observable for updating formatting when marking a location 'complete'
    self.completed = ko.observable(false);

    //Adds a Google Map marker to the object with no associated map
    self.marker = new google.maps.Marker ({
        position: {lat: self.lat, lng: self.lng}
    });

    //Handles changing the completed observable when a checkmark is clicked
    self.toggleComplete = function() {
        self.completed(!self.completed());
    }

    var URL = 'https://en.wikipedia.org/w/api.php?format=json&callback=wikiCallback&action=query&redirects&exintro&prop=extracts&exchars=1500&titles=' 
        + self.name.replace(/ /g,'%20');

    $.ajax(URL, {
        dataType: 'jsonp',
        success: function (response) {
            var pages = response.query.pages;

            $.each(pages, function(key, val) {
                if (key > 0) {
                    self.iw = new google.maps.InfoWindow({
                        content: val.extract + '<a href="http://en.wikipedia.org/?curid=' + val.pageid + '">[via Wikipedia.org]</a>',
                    });
                } else {
                    console.log('Did not find article for ' + self.name);
                }
            });

            if (callback) {
                callback();
            }
        }
    });
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
    self.center = ko.observable(self.locations()[0]);

    //Initializes the Google Map and passes the currentLocations array to it to update markers
    self.map = self.locations();

    //Initializes the Google Maps StreetView and re-centers the map when self.center is changed
    self.streetViewAndCenter = self.center;

    //Bound to clicks on the list div in the UI
    self.reCenter = function (loc) {
        if (self.center().iw) {
            self.center().iw.close();
        }
        self.center(loc);
    }

    self.submit = function () {
        self.search('');
    }

    self.remove = function (loc) {
        loc.marker.setMap(null);
        self.locations.remove(loc);
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
                viewModel.reCenter(loc);
            })
        });
    },

    //Sets marker locations as null or the active Google Map when there are changes to currentLocations
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var map = viewModel.googleMap;

        viewModel.locations().forEach(function (loc) {
            if (loc.marker.getMap() == null) {
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
        var location = ko.utils.unwrapObservable(valueAccessor()),
            center = {lat: location.lat, lng: location.lng},
            map = viewModel.googleMap,
            sv = new google.maps.StreetViewService();

        map.setCenter(center);

        sv.getPanorama({location: center}, function (data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                $(element).show();
                map.setStreetView(new google.maps.StreetViewPanorama(
                    element, {
                        position: center,
                        pov: {
                            heading: 34,
                            pitch: 10
                        }
                    })); 
            } else {
                $(element).hide();
            }
        });

        setTimeout(function() {
            if (location.iw) {
                location.iw.open(map, location.marker);
            }
        }, 500);
    }
}

ko.bindingHandlers.placesSearch = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        viewModel.searchBox = new google.maps.places.SearchBox(element);

        var map = viewModel.googleMap,
            searchBox = viewModel.searchBox;
        
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        })

        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length < 1) {
                return;
            }

            var searchLocation = {
                name: places[0].name,
                lat: places[0].geometry.location.lat(),
                lng: places[0].geometry.location.lng()
            };

            var newloc = new Location(searchLocation);
            viewModel.locations.push(newloc);
            viewModel.reCenter(newloc);

            newloc.marker.addListener('click', function() {
                viewModel.reCenter(newloc);
            });

            viewModel.search('');
        });
    }
}

ko.applyBindings(new ViewModel());