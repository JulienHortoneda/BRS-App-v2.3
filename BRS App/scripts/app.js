//set global variables (for v2 get those from feed)
var currentLang = {index: 2, value: "en"};
var viewConfig = [
    {vid: 0, type: "documents", conv: "basel", logoUrl: "styles/gfx/headerBc.png", title: "Working Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP.12') and Types/any(x: substringof('Working Documents', x/Value) eq true) and Convention eq 'basel'"},
    {vid: 1, type: "documents", conv: "basel", logoUrl: "styles/gfx/headerBc.png", title: "Information Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP.12') and Types/any(x: substringof('Information Documents', x/Value) eq true) and Convention eq 'basel'"},
    {vid: 2, type: "documents", conv: "basel", logoUrl: "styles/gfx/headerBc.png", title: "CRPs", filter: "&$filter=Meetings/any(x: x/Value eq 'COP.12') and Types/any(x: substringof('CRPs', x/Value) eq true) and Convention eq 'basel'"},
    {vid: 3, type: "documents", conv: "basel", logoUrl: "styles/gfx/headerBc.png", title: "Draft Report", filter: "&$filter=Meetings/any(x: x/Value eq 'COP.12') and Types/any(x: substringof('Meeting Report', x/Value) eq true) and Convention eq 'basel'"},
    {vid: 4, type: "agenda", conv: "basel", logoUrl: "styles/gfx/headerBc.png", title: "BC COP-12 Agenda", filter: "&$filter=nodeId eq 'bc' and meetingAccronym eq 'COP.12'"},
    {vid: 10, type: "documents", conv: "rotterdam", logoUrl: "styles/gfx/headerRc.png", title: "Working Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Working documents', x/Value) eq true) and Convention eq 'rotterdam'"},
    {vid: 11, type: "documents", conv: "rotterdam", logoUrl: "styles/gfx/headerRc.png", title: "Information Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Information documents', x/Value) eq true) and Convention eq 'rotterdam'"},
    {vid: 12, type: "documents", conv: "rotterdam", logoUrl: "styles/gfx/headerRc.png", title: "CRPs", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('CRPs', x/Value) eq true) and Convention eq 'rotterdam'"},
    {vid: 13, type: "documents", conv: "rotterdam", logoUrl: "styles/gfx/headerRc.png", title: "Draft Report", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Report', x/Value) eq true) and Convention eq 'rotterdam'"},
    {vid: 14, type: "agenda", conv: "rotterdam", logoUrl: "styles/gfx/headerRc.png", title: "RC COP-7 Agenda", filter: "&$filter=nodeId eq 'rc' and meetingAccronym eq 'COP.7'"},
    {vid: 20, type: "documents", conv: "stockholm", logoUrl: "styles/gfx/headerSc.png", title: "Working Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Working Documents', x/Value) eq true) and Convention eq 'stockholm'"},
    {vid: 21, type: "documents", conv: "stockholm", logoUrl: "styles/gfx/headerSc.png", title: "Information Documents", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Information Documents', x/Value) eq true) and Convention eq 'stockholm'"},
    {vid: 22, type: "documents", conv: "stockholm", logoUrl: "styles/gfx/headerSc.png", title: "CRPs", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('CRPs', x/Value) eq true) and Convention eq 'stockholm'"},
    {vid: 23, type: "documents", conv: "stockholm", logoUrl: "styles/gfx/headerSc.png", title: "Draft Report", filter: "&$filter=Meetings/any(x: x/Value eq 'COP7') and Types/any(x: substringof('Meeting Report', x/Value) eq true) and Convention eq 'stockholm'"},
    {vid: 24, type: "agenda", conv: "stockholm", logoUrl: "styles/gfx/headerSc.png", title: "SC COP-7 Agenda", filter: "&$filter=nodeId eq 'sc' and meetingAccronym eq 'COP.7'"},
    {vid: 30, type: "news", conv: "brs", logoUrl: "styles/gfx/headerBrs.png", title: "Annoucements", filter: "$filter=treaty eq 'brs' and substringof('Mobile App - Annoucements', categories) eq true"},
    {vid: 31, type: "news", conv: "brs", logoUrl: "styles/gfx/headerBrs.png", title: "News", filter: "$filter=treaty eq 'brs' and substringof('Mobile App - News', categories) eq true"},
    {vid: 35, type: "schedule", conv: "brs", logoUrl: "styles/gfx/headerBrs.png", title: "Schedule", startDate: "2015-05-03", endDate: "2015-05-15", filter: "?$filter=meetingId eq guid'900c5b54-2046-e311-ac6e-0050569d5de3'"},
    {vid: 36, type: "documentsNonOfficial", conv: "brs", logoUrl: "styles/gfx/headerBrs.png", title: "Side Event documents", filter: ""}
];

function onPushNotificationReceived(e) {
    alert(JSON.stringify(e));
};

var everlive = new Everlive({
   	apiKey: 'gmC7fCidHmOFfj4A',
    scheme: 'http' // switch this to 'https' if you'd like to use TLS/SSL encryption and if it is included in your subscription tier
});

var devicePushSettings = {
    iOS: {
    	badge: 'true',
        sound: 'true',
        alert: 'true'
	},
    android: {
    	projectNumber: 'AIzaSyAAUW8xOLNMtOl_Eu9U49HruLRyLpBqlx8'
    },
   	notificationCallbackIOS: onPushNotificationReceived,
    notificationCallbackAndroid: onPushNotificationReceived
};

var app;
(function () {
    document.addEventListener("deviceready", function () {  
        navigator.splashscreen.hide();

        app = new kendo.mobile.Application(document.body,  {
            layout: "main-layout",
            skin: "flat",
            initial: "views/news.html?vid=30"
            //initial: "views/documents.html?vid=0"
        });
    }, false);

    window.app = app;
}());


//helpers functions
function openLinkInBrowser(e) {
    //open file in browser using cordova AppInBrowser
    var btnData = e.button.data();
    window.open(btnData.brsurl, '_system', 'location=no,EnableViewPortScale=yes');
}

function extractUrlParams() {
    // get all querystring parameters and store in array
    var location = window.location.toString();
    var prms = location.substring(location.lastIndexOf('?'));
    var t = prms.substring(1).split('&');
    var f = [];
    for (var i = 0; i < t.length; i++) {
        var x = t[i].split('=');
        f[x[0]] = x[1];
    }
    return f;
}

function switchChange(e)
{
	if (e.checked)
	{
		everlive.push.register(devicePushSettings, function() {
            alert("Successful registration in Backend Services. You are ready to receive push notifications.");
        }, function(err) {
            alert("Error: " + err.message);
        });
	}
	else
	{
		el.push.unregister(function()
		{
		}, function(err)
		{
			alert("Error: " + err.message);
		});
	}
}

function decodeHTML(EncodedHtml) {
    //convert string with encoded HTML chars to tags that are rendered
    return $('<div/>').html(EncodedHtml).text();
}

function setViewIdentity(e) {
    //set view logo once loaded
    var UrlParams = extractUrlParams();
    var viewId = UrlParams['vid'];
    if (viewId == undefined) {viewId = 1;}
    for (var i = 0; i < viewConfig.length; i++) {
        if (viewConfig[i].vid == parseInt(viewId)) {
            $("#brsHeaderImg img").attr("src", viewConfig[i].logoUrl);
            $("#brsHeaderImgBack img").attr("src", viewConfig[i].logoUrl);
        }
    }
}

function showAgendaDocs(e) {
    //navigate from agenda view to agenda item detailed view with documents list
    var btnData = e.button.data();
    if (btnData.docs !== "") {
        app.navigate("views/agendaDetails.html?vid=" + btnData.vid + "&agenda=" + btnData.agenda + "&docs=" + btnData.docs);
        //$("#oLog").append("<p>docs: " + btnData.unnumbers + "</p>");
    }
}

function setAgendaDetails(e) {
    setViewIdentity(null);
    var UrlParams = extractUrlParams();
    //$("#agendaTitle").prepend("Agenda Item " + kendo.htmlEncode(UrlParams['agenda']));
    $("#agendaTitle").text("Agenda Item " + UrlParams['agenda']).html();
}

function setLangFilters() {
    //show selected language
    $(".activeLabel").removeClass("activeLabel");
    $(".label_"+ $(".langSelect li").eq(this.current().index()).attr("value")).addClass("activeLabel");
    
    //set current language (remember prefered language)
    $("#hdnLang").text($(".langSelect li").eq(this.current().index()).attr("value"));
    $("#hdnLangIndex").text(this.current().index());
    
    //show - hide languages labels
    displayActiveLanguageLabels();
}

function displayActiveLanguageLabels() {
    //check if default lang (en) should be displayed if nothing in selected language  
    var selLangVal = $("#hdnLang").text();
    var selLangIndex = parseInt($("#hdnLangIndex").text());
    //select language button, if any
    var buttongroup = $(".langSelect").data("kendoMobileButtonGroup");
    buttongroup.select(selLangIndex);
    //not really elegant, but under deadline...
    //update documents
    $("#docsList").find(".oDoc").each(function( index ) {
        if ($( this ).find(".label_" + selLangVal).length == 0) {
              $( this ).find(".label_en").addClass("activeLabel");
        }
    });
    //update agenda
    $("#confAgenda").find(".agendaItem").each(function( index ) {
        if ($( this ).find(".label_" + selLangVal).length == 0) {
              $( this ).find(".label_en").addClass("activeLabel");
        }
    });
    //update agenda details - 
    $("#agendaDetail").find(".oDoc").each(function( index ) {
        if ($( this ).find(".label_" + selLangVal).length == 0) {
              $( this ).find(".label_en").addClass("activeLabel");
        }
    });
}
