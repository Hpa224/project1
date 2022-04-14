$(document).ready(function() {
    // Initialize Firebase
    // Your web app's Firebase configuration
    var firebaseConfig = { //db for production
        apiKey: "AIzaSyCVG0EbnjHGxAlJfNRPnppdsbVGoeAR_0A",
        authDomain: "project1-419db.firebaseapp.com",
        databaseURL: "https://project1-419db.firebaseio.com",
        projectId: "project1-419db",
        storageBucket: "project1-419db.appspot.com",
        messagingSenderId: "78571791945",
        appId: "1:78571791945:web:a3fb18f06a4d5be02dc198"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Create a variable to reference the database function
    let database = firebase.database();

    let item = "hats";
    let zip = "33172";
    let radius = 10000;
    let storeNum = 5;
    let storeName = "";
    let storeAdd = "";
    let storeDist = "";
    let storePhone = "";
    let submitcount = 0;

    M.AutoInit(); //moved over from index.html
    $(".modal").modal();

    //display base map. 
    L.mapquest.key = 'jwKdDQ2lmEqM8llBH4rcUsNACRDmOug8';
    let map = L.mapquest.map('map', {
        center: [25.74, -80.29],
        layers: L.mapquest.tileLayer('map'),
        zoom: 11
    });

    //clear database upon get started click
    $("#download-button").on("click", function(event) {
        database.ref("/search").remove(); //remove previous search from realtime db
    });

    // Capture Button Click to search for items
    $("#submitButton").on("click", function(event) {
        // Don't refresh the page!
        event.preventDefault();

        item = $("#searchItem").val().trim();
        zip = $("#zipCode").val().trim();
        radius = Math.round(($("#radius").val().trim() * 1609.34));
        storeNum = $("#storeNum").val().trim();

        //input validation - future revision using modals vs alerts
        // if (item == "") {
        //     alert("Please enter an item to search for")
        // };
        // if (zip == "") {
        //     alert("Please enter a zipcode")
        // };
        // if (radius == "") {
        //     alert("Please select a radius to search")
        // };
        // if (storeNum == "") {
        //     alert("Please enter a number of stores to return")
        // };

        $('.modal').modal("close"); //moved from justeed below prevent default

        console.log(item);
        console.log(zip);
        console.log(radius);
        console.log(storeNum);
        submitcount++

        // if check deletes previous tables if user does more than one search.
        if (submitcount >= 1) {
            $("#zipCode").val("");
            $("#searchItem").val("");
            $(".tables").empty();
            $(".text-marker").empty();
        }

        //prepare api key and query url for ajax call

        let apikey = "gTjdY5VU8HGdlD9j49AxAHau7GFoTNJGNkmI9tTrRDlBfrsTEtPIj26Yazt1VON8hNn1lDqc23xE4JTEPZpsDlNp3IJW40UI9nSTG67_TTzJuar-7pj19hIddXJXYnYx";
        let queryurl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + item + "&location=" + zip + "&radius=" + radius + "&limit=" + storeNum;

        // ajax call to yelp fusion api
        $.ajax({
            url: queryurl,
            headers: {
                "Authorization": "Bearer " + apikey,
            },
            method: 'GET',
            dataType: 'json'
        }).then(function(response) {
            console.log("Ajax response object=" + response);
            let base = response.businesses;
            console.log("base object =" + base);
            console.log("stringified base object =" + JSON.stringify(base));
            //center map to search location/nearest store returned

            // let map = L.mapquest.map('map', {  //for future functionality - centers map on nearest returned store
            //     center: [base[0].coordinates.latitude, base[0].coordinates.longitude],
            //     layers: L.mapquest.tileLayer('map'),
            //     zoom: 12
            // });

            //parse return for display
            for (let i = 0; i < base.length; i++) {
                storeName = base[i].name;
                lat = base[i].coordinates.latitude;
                long = base[i].coordinates.longitude;
                storeAdd = base[i].location.display_address;
                storePhone = base[i].display_phone;
                storeDist = base[i].distance;
                //  write to table
                let newStore = $("<tr class='tables'>").append(
                    $("<td>").text(item),
                    $("<td>").text(storeName),
                    $("<td>").text(storeAdd),
                    $("<td>").text(Math.round((storeDist) / 1609.344)),
                    $("<td>").text(storePhone)
                );
                $("#table").append(newStore);

                //plot markers on maps
                L.mapquest.textMarker([lat, long], {
                    text: storeName,
                    subtext: storeAdd,
                    draggable: false,
                    position: 'right',
                    type: 'marker',
                    icon: {
                        primaryColor: '#333333',
                        secondaryColor: '#333333',
                        size: 'sm'
                    }
                }).addTo(map);

                //enter into realtime database for future authenticated user functionality
                database.ref("/search").push({
                    item: item,
                    zip: zip,
                    radius: radius,
                    storeNum: storeNum,
                    storeName: storeName,
                    storeAdd: storeAdd,
                    storeDist: storeDist,
                    lat: lat,
                    long: long,
                    storePhone: storePhone,
                    dateAdded: firebase.database.ServerValue.TIMESTAMP
                });
            };
        });
    });
});