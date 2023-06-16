require([
    "esri/Map",
    "esri/Ground",
    "esri/layers/ElevationLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/SceneLayer",
    "esri/views/SceneView",
    "esri/widgets/Home",
    "esri/widgets/Slider"
], (
    Map,
    Ground,
    ElevationLayer,
    FeatureLayer,
    TileLayer,
    SceneLayer,
    SceneView,
    Home,
    Slider
) => {
    // Get data layers
    const elevationLayer = new ElevationLayer({
        url: "https://tiles.arcgis.com/tiles/wQnFk5ouCfPzTlPw/arcgis/rest/services/SF_Topobathy/ImageServer"
    });

    const imageryLayer = new TileLayer({
        url: "https://tiles.arcgis.com/tiles/wQnFk5ouCfPzTlPw/arcgis/rest/services/SF_Imagery_NAIP2022/MapServer"
    });

    const buildingsLayer = new SceneLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/SF_BLDG_WSL1/SceneServer/layers/0"
    });

    const seaLevelLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/wQnFk5ouCfPzTlPw/arcgis/rest/services/SF_Inundation/FeatureServer/2"
    });
    
    // Create Map from data layers
    const map = new Map({
        basemap: null,  //"satellite",
        ground: new Ground({  //"world-elevation"
            surfaceColor: [0, 0, 0],
            layers: [elevationLayer]
        }),
        layers: [imageryLayer, seaLevelLayer, buildingsLayer]
    });

    // Add map to a SceneView
    const view = new SceneView({
        container: "viewDiv",  // Reference to the DOM node that will contain the view
        map: map,  // References the map object created in step 3
        viewingMode: "local",  // Indicates to create a local scene,
        camera: {
            position: {
                x: -122.30, //Longitude
                y: 37.95, //Latitude
                z: 15000 //Meters
            },
            tilt: 60,
            heading: 210
        },
        environment: {
            background: {
                type: "color", // autocasts as new ColorBackground()
                color: [0, 0, 0]
            },
            // disable stars
            starsEnabled: false,
            //disable atmosphere
            atmosphereEnabled: false
        }
    });

    const homeBtn = new Home({
        view: view
    });

    // Add the home button to the top left corner of the view
    view.ui.add(homeBtn, "top-right");

    // Create sea level slider and add to map
    const slider = new Slider({
        container: "sliderDiv",
        min: 0,
        max: 70,
        steps: 5,
        values: [5],
        layout: "vertical",
        snapOnClickEnabled: false,
        visibleElements: {
            labels: true,
            rangeLabels: true
        }
    });

    view.ui.add("infoDiv", { position: "bottom-left" });
    slider.on(
        ["thumb-drag", "thumb-change", "segment-drag"],
        updateSeaLevelFilter
    );

    // Update sea level filter based on slider
    let seaLevelView;
    function updateSeaLevelFilter() {
        console.log(slider.values[0]);
        seaLevelView.filter = {
            where: `Elevation_m = ${slider.values[0]}`
        };
        // seaLevelView.elevationInfo = {
        //     mode: "absolute-height",
        //     offset: slider.values[0],
        //     unit: "meters"
        // };
    }

    // Update sea level filter on layer load
    view.whenLayerView(seaLevelLayer).then(layerView => {
        seaLevelView = layerView;
        updateSeaLevelFilter();
    })
});