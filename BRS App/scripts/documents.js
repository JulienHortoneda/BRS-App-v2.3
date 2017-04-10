
(function () {
    window.documents = {
        init: function() {
            //get current view id, to be used as selector later on
            var curViewSelector = this.content;
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //check if newer config is available
                var isOldVersion = isOldConfig(oViewConfig.version);
                //check if language selection should be hidden
                if (!oViewConfig.isMultilingual) {
                    curViewSelector.find(".langBtns").hide();
                }
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set language
                currentLang.value = $("#hdnLang").text();
                
                //set datasource for this doc list
                var docsDataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    serverSorting: true,
                    serverPaging: true,
                    pageSize: 100,
                    type: "odata",
                    transport: {
                        read: {
                            url: oViewConfig.feedUrl,
                            dataType: "jsonp"
                        }
                    },
                    schema: {
                        data: function (data) {
                            //implement un number sort here by adding a sortorder filed and sorting the array (alpha numeric sort) before returning data 
                            var docs = [];
                            for (var i = 0; i < data.value.length; i++) {
                                var doc = {
                                    sortOrder: setDocDisplayOrder(data.value[i].UnNumber),
                                    UnNumber: data.value[i].UnNumber,
                                    Meetings: data.value[i].Meetings,
                                    //sort files by extension
                                    Files: data.value[i].Files.sort(function(a,b) {return (a.Extension > b.Extension) ? 1 : ((b.Extension > a.Extension) ? -1 : 0);} ),
                                    Titles: data.value[i].Titles,
                                    Types: data.value[i].Types
                                };
                                docs.push(doc);
                            }
                            //sort response based on calculated sortOrder
                            docs.sort(function(a, b){
                                return a.sortOrder - b.sortOrder;
                            });
                            //return response with new format
                            return docs;
                        },
                        //because KendoUI still communicates in the OData V2
                        total: function (data) {
                            return data['odata.count'];
                        }
                    }
                });
                
                //display docs
                curViewSelector.find(".docsList").kendoMobileListView({
                    dataSource: docsDataSource,
                    template: $("#" + oViewConfig.templateId).html(),
                    dataBound: function(e) {
                        //check if no documents yet
                        if (this.items().length <= 0) {
                            curViewSelector.find(".langBtns").hide();
                            curViewSelector.find(".oLog").html("<p class=\"attentionNote\">Documents will be displayed in this screen as soon as they will be published by the Secretariat in the course of the Conference.</p>").show();
                        }
                        //show - hide languages labels
                        displayActiveLanguageLabels();
                    }
                });
            }
        }
    };
    window.agendadetails = {
        init: function() {
            //get current view id, to be used as selector later on
            var curViewSelector = this.content;
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //check if language selection should be hidden
                if (!oViewConfig.isMultilingual) {
                    curViewSelector.find(".langBtns").hide();
                }
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set agenda item sub title
                curViewSelector.find(".agendaDetailsItemTitle").text("Agenda item " + this.params.agenda);

                //set language
                currentLang.value = $("#hdnLang").text();
                
                //set feed url and array to filter the docs
                var agendaDocsFeed = "http://informea.pops.int/BrsDocuments/MFiles.svc/Documents?$select=DocumentId,UnNumber,Files/Extension,Files/Language,Files/Url,Titles/Value,Titles/Language&$expand=Files,Titles";
                //filter doc list by un numbers passed as parameters
                var agendaFeedFilters = { logic: "or", filters: [] };
                var docsprm = this.params.docs.split("|");
                for (i = 0; i < docsprm.length; i++) {
                    agendaFeedFilters.filters.push({ field: "UnNumber", operator: "eq", value: docsprm[i] });
                }
                
                //set datasource for this doc list
                var docsDataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    serverSorting: true,
                    serverPaging: true,
                    pageSize: 100,
                    type: "odata",
                    transport: {
                        read: {
                            url: agendaDocsFeed,
                            dataType: "jsonp"
                        }
                    },
                    filter: agendaFeedFilters,
                    schema: {
                        data: function (data) {
                            //implement un number sort here by adding a sortorder filed and sorting the array (alpha numeric sort) before returning data 
                            var docs = [];
                            for (var i = 0; i < data.value.length; i++) {
                                var doc = {
                                    sortOrder: setDocDisplayOrder(data.value[i].UnNumber),
                                    UnNumber: data.value[i].UnNumber,
                                    Meetings: data.value[i].Meetings,
                                    //sort files by extension
                                    Files: data.value[i].Files.sort(function(a,b) {return (a.Extension > b.Extension) ? 1 : ((b.Extension > a.Extension) ? -1 : 0);} ),
                                    Titles: data.value[i].Titles,
                                    Types: data.value[i].Types
                                };
                                docs.push(doc);
                            }
                            //sort response based on calculated sortOrder
                            docs.sort(function(a, b){
                                return a.sortOrder - b.sortOrder;
                            });
                            //return response with new format
                            return docs;
                        },
                        //because KendoUI still communicates in the OData V2
                        total: function (data) {
                            return data['odata.count'];
                        }
                    }
                });

                //display docs
                curViewSelector.find(".agendaDetail").kendoMobileListView({
                    dataSource: docsDataSource,
                    template: $("#docsListOfficial-template").html(),
                    dataBound: function(e) {
                        //check if no documents yet
                        if (this.items().length <= 0) {
                            curViewSelector.find(".langBtns").hide();
                            curViewSelector.find(".oLog").html("<p class=\"attentionNote\">Documents will be displayed in this screen as soon as they will be published by the Secretariat in the course of the Conference.</p>").show();
                        }
                        //show - hide languages labels
                        displayActiveLanguageLabels();
                    }
                });
            }
        }
    };
}());

function setDocDisplayOrder(unNumber){
    //define sort order based on UN-Number digits (ex. UNEP/POPS/COP.7/11/Add.2/Rev.1 or UNEP/POPS/COP.7/INF/11/Add.2/Rev.1)
    var sortOrder = 0;
    if (unNumber !== "" && unNumber !== null) {
        var oParts = unNumber.split("/");
        for (var i = 0; i < oParts.length; i++) {
            //check if part has a . followed by a digit (meeting number)
            if (oParts[i].indexOf("CHW.") >= 0 || oParts[i].indexOf("COP.") >= 0) {
                //extract the digit and * 1000 or 2000 if INF doc
                if (unNumber.indexOf("/INF/") > 0) {
                    sortOrder = sortOrder + parseInt(oParts[i].replace("COP.", "").replace("CHW.", "")) * 2000;    
                }
                else {
                    sortOrder = sortOrder + parseInt(oParts[i].replace("COP.", "").replace("CHW.", "")) * 1000;    
                }
            }
            //check if part has a doc number, and * 100
            if(!isNaN(parseInt(oParts[i]))) {
                sortOrder = sortOrder + parseInt(oParts[i]) * 100;
            }
            //check if part has add number (*2) or rev number (*4)
            if (oParts[i].indexOf("Add.") >= 0) {
                //extract digit and * 4
                sortOrder = sortOrder + parseInt(oParts[i].replace("Add.", "")) * 4;    
            }
            if (oParts[i].indexOf("Rev.") >= 0) {
                //extract digit and * 6
                sortOrder = sortOrder + parseInt(oParts[i].replace("Rev.", "")) * 6;    
            }
            if (oParts[i].indexOf("Corr.") >= 0) {
                //extract digit and * 2
                sortOrder = sortOrder + parseInt(oParts[i].replace("Corr.", "")) * 2;    
            }
        }
    }
    
    return sortOrder;
}

