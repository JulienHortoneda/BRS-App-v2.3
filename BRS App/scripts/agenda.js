//set var to re-use in template
var viewId = "";
(function () {
    window.agenda = {
        init: function() {
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //check if newer config is available
                var isOldVersion = isOldConfig(oViewConfig.version);
                viewId = oViewConfig.id;
                //check if language selection should be hidden
                if (!oViewConfig.isMultilingual) {
                    $(".langBtns").hide();
                }
                //set header and view title
                setHeaderContent(this, oViewConfig);
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
                            url: oViewConfig.feedUrl,
                            dataType: "jsonp"
                        }
                    },
                    schema: {
                        // feed is in V3
                        data: function (data) {
                            return data["value"];
                        },
                        total: function (data) {
                            return data["odata.count"];
                        }
                    }
                });
                
                //display agenda
                $("#confAgenda").kendoMobileListView({
                    dataSource: agendaDataSource,
                    template: $("#" + oViewConfig.templateId).html(),
                    dataBound: function(e) {
                        //show - hide languages labels
                        displayActiveLanguageLabels();
                    }
                }); 
            }
              
        }
    };  
}());