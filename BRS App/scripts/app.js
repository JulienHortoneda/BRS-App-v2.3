//set global variables
var currentLang = {index: 2, value: "en"};
var brsAppConfig; //array to store app config from the feed

function onPushNotificationReceived(e) {
    alert(JSON.stringify(e));
};

var everlive = new Everlive({
   	apiKey: 'JKpGWmBe8Fc5e4e0uYP1BhGBKERVAi4L',
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
        //get app config from feed
        var oInitialView = "views/news.html?vid=1";
        var brsAppConfigDS = getConfigDatasource(); 
        brsAppConfigDS.fetch(function(){
            oInitialView = initDrawerAndGetInitialView(this);
        }).then(function(){
            //init app, once drawer content is ready
            app = new kendo.mobile.Application(document.body,  {
                layout: "main-layout",
                skin: "flat",
                initial: oInitialView
            });
            navigator.splashscreen.hide();
        });
        
    }, false);

    window.app = app;
}());


//helpers functions
function getConfigDatasource() {
    var brsAppConfigDS = new kendo.data.DataSource({
        serverFiltering: true,
        serverSorting: true,
        serverPaging: true,
        type: "odata",
        transport: {
            read: {
                url: "http://informea.pops.int/brsApp3/brsApp.svc/Config",
                dataType: "jsonp"
            }
        },
        sort: { field: "displayOrder", dir: "asc" },
        schema: {
            // feed is in OData v3
            data: function (data) {
                return data["value"];
            },
            total: function (data) {
                return data["odata.count"];
            }
        }
    });
    return brsAppConfigDS;
}

function initDrawerAndGetInitialView(oData){
    var oInitialView = "views/news.html?vid=1";
    var configData = oData.data();
    brsAppConfig = oData.data();
    var oMenu = $("#app-drawer").find(".brsMenu");
    //if config is reloaded, remove the current items
    oMenu.find("li").remove();
    //render flat list in the drawer
    for (var i = 0; i < configData.length; i++) {
        var oStyle = "";
        if (configData[i].drawerItemStyle !== null) {
            oStyle =  " style=\"" + configData[i].drawerItemStyle + "\"";
        }
        if (configData[i].screenUrl == null) {
            oMenu.append("<li data-brsviewid=\"" + configData[i].id + "\" data-brsparentid=\"" + configData[i].parentId + "\"" + oStyle + ">" + configData[i].nameShort + "</li>");
        }
        else {
            oMenu.append("<li data-brsviewid=\"" + configData[i].id + "\" data-brsparentid=\"" + configData[i].parentId + "\"" + oStyle + "><a data-role=\"button\" href=\"" + configData[i].screenUrl + "?vid=" + configData[i].id + "\">" + configData[i].nameShort + "</a></li>");
        }
        //save initial view
        if (configData[i].isHome == 1) {
            oInitialView = configData[i].screenUrl + "?vid=" + configData[i].id;
        }
    }
    //re-arrange the list based on hierarchy
    oMenu.find("li").each(function(index){
        if ($(this).attr("data-brsparentid") !== "null") {
            //check if sub-list exists in parent
            if (oMenu.find("li[data-brsviewid='" + $(this).attr("data-brsparentid") + "'] > ul").length == 0) {
                oMenu.find("li[data-brsviewid='" + $(this).attr("data-brsparentid") + "']").append("<ul></ul>");
            }
            $(this).appendTo(oMenu.find("li[data-brsviewid='" + $(this).attr("data-brsparentid") + "'] > ul"));
        }
    });
    //return initial view
    return oInitialView;
}

function openLinkInBrowser(e) {
    //open file in browser using cordova AppInBrowser
    var btnData = e.button.data();
    window.open(btnData.brsurl, '_system', 'location=no,EnableViewPortScale=yes');
    if (window.event) {
        window.event.preventDefault && window.event.preventDefault();
        window.event.returnValue = false;
    }
}
function navigateToExternalUrl(url){
    if (url.substring(0, 4) === 'geo:' && device.platform === 'iOS') {
            url = 'http://maps.apple.com/?ll=' + url.substring(4, url.length);
        }
        window.open(url, '_system');
        if (window.event) {
            window.event.preventDefault && window.event.preventDefault();
            window.event.returnValue = false;
        }
}

function switchChange(e)
{
	if (e.checked)
	{
		everlive.push.register(devicePushSettings, function() {
            alert("Successful registration to receive push notifications.");
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

function showAgendaDocs(e) {
    //navigate from agenda view to agenda item detailed view with documents list
    var btnData = e.button.data();
    if (btnData.docs !== "") {
        app.navigate("views/agendaDetails.html?vid=" + btnData.vid + "&agenda=" + btnData.agenda + "&docs=" + btnData.docs);
    }
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

function getViewConfig(oView){
    //var UrlParams = extractUrlParams();
    var viewId = oView.params.vid;
    if (viewId == undefined) {viewId = 1;}
    var oViewConfig = $.grep(brsAppConfig, function (e) { return e.id == viewId; });
    if (oViewConfig.length == 1) {
        return oViewConfig[0];
    }
    else {
        return undefined;
    }
}

function setHeaderContent(oView, oViewConfig) {
    //set header brsHeaderBack
    oView.header.find("#brsHeader > img").attr("src", oViewConfig.headerIconUrl);
    oView.header.find("#brsHeaderBack > img").attr("src", oViewConfig.headerIconUrl);
    oView.header.find("#brsHeader").append(oViewConfig.headerText);
    oView.header.find("#brsHeaderBack").append(oViewConfig.headerText);
    oView.header.find("#brsHeader").append("<div class=\"clear\"></div>");
    oView.header.find("#brsHeaderBack").append("<div class=\"clear\"></div>");
    //set set view title
    oView.options.title = oViewConfig.nameLong;
    //set view description
    if (oViewConfig.description !== null) {
        oView.content.find(".brsViewDescription").text(decodeHTML(oViewConfig.description)).show();
    }
}

function getLanguageCode(langId) {
    var langCode = "en";
    switch(parseInt(langId)) {
        case 1:
            langCode = "ar";
            break;
        case 2:
            langCode = "zh";
            break;
        case 4:
            langCode = "fr";
            break;
        case 5:
            langCode = "ru";
            break;
        case 6:
            langCode = "es";
            break;
        default:
            langCode = "en";
    }
    return langCode;
}

function isOldConfig(currVersion) {
    //check if a more recent version of the config exists
    var res = false;
    var brsAppConfigDS = getConfigDatasource();
    brsAppConfigDS.query({
        filter: { field: "version", operator: "gt", value: currVersion }
    }).then(function(e) {
        var view = brsAppConfigDS.view();
        //console.log(view.length);
        if (view.length > 0) {
            $(".btnReload").show();
            res = true;
        } 
        return res;
    });
}

function reloadConfig() {
    //reload the drawer & the config array
    var oInitialView = "views/news.html?vid=1";
    var brsAppConfigDS = getConfigDatasource(); 
    brsAppConfigDS.fetch(function(){
        oInitialView = initDrawerAndGetInitialView(this);
    }).then(function(){
        //init app, once drawer content is ready
        $(".btnReload").hide();
        app.initial = oInitialView;
    });
}