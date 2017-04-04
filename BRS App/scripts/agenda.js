//set var to re-use in template
var viewId = "";
(function () {
    window.agenda = {
        init: function() {
            //get view config from url and array
            var UrlParams = extractUrlParams();
            viewId = UrlParams['vid'];
            if (viewId == undefined) {viewId = 1;}
            var agendaFeed = "http://informea.pops.int/MobileApp/brsMobileApp2.svc/AgendaItems?$expand=AgendaItemDocs,AgendaItemTitles";
            for (var i = 0; i < viewConfig.length; i++) {
                if (viewConfig[i].vid == parseInt(viewId)) {
                    agendaFeed = agendaFeed + viewConfig[i].filter;
                    conv = viewConfig[i].conv;
                    header = viewConfig[i].title;
                    this.header.find('[data-role="navbar"]').data('kendoMobileNavBar').title(viewConfig[i].title);
                }
            }
            //set language
            currentLang.value = $("#hdnLang").text();
            
            //set datasource for this agenda
            var agendaDataSource = new kendo.data.DataSource({
                serverFiltering: true,
                serverSorting: true,
                serverPaging: true,
                pageSize: 200,
                type: "odata",
                transport: {
                    read: {
                        url: agendaFeed,
                        dataType: "jsonp"
                    }
                },
                sort: { field: "DisplayOrder", dir: "asc" }
            });
            
            //display agenda
            $("#confAgenda").kendoMobileListView({
                dataSource: agendaDataSource,
                template: $("#agenda-template").html(),
                dataBound: function(e) {
                    //show - hide languages labels
                    displayActiveLanguageLabels();
                }
            });   
        }
    };  
}());