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
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
}

var ViewModel = function () {
	var self = this;

    self.locations = ko.observableArray([]);

    initialLocations.forEach(function (loc) {
        self.locations.push(new Location(loc));
    });

    self.mapView = ko.observable(self.locations()[0]);

    self.changeView = function (loc) {
        console.log("in change view");
        self.mapView = ko.observable(loc);
    }

}

ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        //console.log(allBindings.has('name'));

        var latLng = new google.maps.LatLng(
                        ko.utils.unwrapObservable(mapObj.lat),
                        ko.utils.unwrapObservable(mapObj.lng));

        var mapOptions = { center: latLng,
                          zoom: 7, 
                          mapTypeId: google.maps.MapTypeId.ROADMAP,
                          mapTypeControl: false,
                          streetViewControl: false};
        
        mapObj.googleMap = new google.maps.Map(element, mapOptions);
        

        initialLocations.forEach(function (loc) {
            mapObj.marker = new google.maps.Marker({
                map: mapObj.googleMap,
                position: {lat: loc.lat, lng: loc.lng},
                title: loc.name,
            });
        }); 
        
        mapObj.onChangedCoord = function(newValue) {
            console.log("in changed coord");
            var latLng = new google.maps.LatLng(
                ko.utils.unwrapObservable(mapObj.lat),
                ko.utils.unwrapObservable(mapObj.lng));
            mapObj.googleMap.setCenter(latLng);                 
        };
        
        /*mapObj.onMarkerMoved = function(dragEnd) {
            var latLng = mapObj.marker.getPosition();
            mapObj.lat(latLng.lat());
            mapObj.lng(latLng.lng());
        };*/
        
        //mapObj.subscribe(mapObj.onChangedCoord);
        //mapObj.lng.subscribe(mapObj.onChangedCoord);

        viewModel.mapView.subscribe(mapObj.onChangedCoord);

        //mapObj.loc.subscribe(mapObj.onChangedCoord);
        
        //google.maps.event.addListener(mapObj.marker, 'dragend', mapObj.onMarkerMoved);
        
        //$("#" + element.getAttribute("id")).data("mapObj",mapObj);
    },

    /*update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());

        var latLng = new google.maps.LatLng(
                        ko.utils.unwrapObservable(mapObj.lat),
                        ko.utils.unwrapObservable(mapObj.lng));

        var mapOptions = { center: latLng,
                          zoom: 7, 
                          mapTypeId: google.maps.MapTypeId.ROADMAP,
                          mapTypeControl: false,
                          streetViewControl: false};
        
        mapObj.googleMap = new google.maps.Map(element, mapOptions);
        

        initialLocations.forEach(function (loc) {
            mapObj.marker = new google.maps.Marker({
                map: mapObj.googleMap,
                position: {lat: loc.lat, lng: loc.lng},
                title: loc.name,
            });
        }); 
    }*/
};

ko.applyBindings(new ViewModel());