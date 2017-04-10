(function () {
    window.schedule = {
        init: function() {
            //get current view id, to be used as selector later on
            var curViewSelector = this.content;
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            //init dates variables
            var currDay = kendo.parseDate(kendo.toString(kendo.parseDate(new Date()), "yyyy-MM-dd") + " 00:00");
            var oStart;
            var oEnd;
            if (oViewConfig !== undefined) {
                //check if newer config is available
                var isOldVersion = isOldConfig(oViewConfig.version);
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set language
                currentLang.value = $("#hdnLang").text();
                //init local datasource (ease the filtering)
                var scheduleLocalData;
                //set datasource for this doc list
                var scheduleDataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    serverSorting: true,
                    serverPaging: true,
                    pageSize: 500, //max from server
                    type: "odata",
                    transport: {
                        read: {
                            url: oViewConfig.feedUrl,
                            dataType: "jsonp"
                        },
                        parameterMap: function(options) {
                            // call the default OData parameterMap, as JS does not handle guid
                            var result = kendo.data.transports.odata.parameterMap(options);
                            if (result.$filter) {
                                // encode everything which looks like a GUID
                                var guid = /('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')/ig;
                                result.$filter = result.$filter.replace(guid, "guid$1");
                            }
                            return result;
                        }
                    },
                    schema: {
                        // feed is in OData v3
                        data: function (data) {
                            //convert date to string because somehow filtering by date won't work when > 00:00 and < 23:59
                            return data["value"]
                        },
                        total: function (data) {
                            return data["odata.count"];
                        }
                    }
                });
                
                //get and process live data before showing the list
                scheduleDataSource.fetch(function(){
                    scheduleLocalData = this.data();
                    //get first and last day dates (needs feed to be sorted by date)
                    if (scheduleLocalData.length > 0) {
                        oStart = kendo.parseDate(kendo.toString(kendo.parseDate(scheduleLocalData[0].startDate), "yyyy-MM-dd") + " 00:00");
                        oEnd = kendo.parseDate(kendo.toString(kendo.parseDate(scheduleLocalData[scheduleLocalData.length - 1].endDate), "yyyy-MM-dd") + " 23:59");
                        //check if current day in range and point to start day if not
                        if (currDay < oStart || currDay > oEnd) { currDay = oStart; } 
                        //set the date navigation buttons and boundaries
                        curViewSelector.find(".btnsSchedule").attr("data-brsmindate", oStart);
                        curViewSelector.find(".btnsSchedule").attr("data-brsmaxdate", oEnd);
                        setSchduleButtons(currDay);
                    }
                }).then(function(){
                    //set filter for active day (the localDatasource is already filtered by meeting) - wired, date comesback in string...
                    //var oFilter = [{ field: "startDate", operator: "gt", value: kendo.parseDate(kendo.toString(currDay, "yyyy-MM-dd") + " 00:00") }, { field: "startDate", operator: "lt", value: kendo.parseDate(kendo.toString(currDay, "yyyy-MM-dd") + " 23:59") }];
                    //var oFilter = [{ field: "startDate", operator: "gt", value: kendo.toString(currDay, "yyyy-MM-dd") + " 00:00" }, { field: "startDate", operator: "lt", value: kendo.toString(currDay, "yyyy-MM-dd") + " 23:59" }];
                    var oFilter = { field: "startDate", operator: "startswith", value: kendo.toString(currDay, "yyyy-MM-dd") };
                    //set local ds
                    var scheduleLocalDataSource = new kendo.data.DataSource({                            
                            data: scheduleLocalData,
                            filter: oFilter,
                            sort: [
                                { field: "startDate", dir: "asc" },
                                { field: "name", dir: "asc" }
                            ]
                    });
                    //display events
                    curViewSelector.find(".scheduleList").kendoMobileListView({
                        dataSource: scheduleLocalDataSource,
                        template: $("#" + oViewConfig.templateId).html(),
                        dataBound: function(e) {
                            //check if no event yet
                            if (this.items().length <= 0) {
                                curViewSelector.find(".oLog").html("<p class=\"attentionNote\">No events available for this day.</p>").show();
                            }
                        },
                        click: function(e) {
                            //if already expanded, hide
                            if ($(e.item).find(".km-icon").hasClass("km-arrow-c")) {
                                $(e.item).find(".scheduleDescription").hide("slow");
                                $(e.item).find(".km-icon").removeClass("km-arrow-c").addClass("km-arrow-e");
                            }
                            else {
                                //collapse open descriptions + icons 
                                curViewSelector.find(".scheduleList").find(".scheduleDescription").hide();
                                curViewSelector.find(".scheduleList").find(".km-icon").removeClass("km-arrow-c").addClass("km-arrow-e");
                                //show selected
                                $(e.item).find(".scheduleDescription").show("slow");
                                $(e.item).find(".km-icon").removeClass("km-arrow-e").addClass("km-arrow-c");
                            }
                        }
                    });
                });
                
            }
            
        }
    };    
}());

function setSchduleButtons(activeDay) {
    var curViewSelector = app.view().content;
    //get start and end date from html
    var oStart = kendo.parseDate(kendo.toString(kendo.parseDate(curViewSelector.find(".btnsSchedule").attr("data-brsmindate")), "yyyy-MM-dd") + " 00:00");
    var oEnd = kendo.parseDate(kendo.toString(kendo.parseDate(curViewSelector.find(".btnsSchedule").attr("data-brsmaxdate")), "yyyy-MM-dd") + " 23:59");
    //check if date navigation buttons should be hidden
    if (activeDay <= oStart) { 
        curViewSelector.find(".btnsSchedulePrev").hide(); 
    }
    else {
        curViewSelector.find(".btnsSchedulePrev").show(); 
    }
    if (kendo.parseDate(kendo.toString(kendo.parseDate(activeDay), "yyyy-MM-dd") + " 23:59") >= oEnd) { 
        curViewSelector.find(".btnsScheduleNext").hide(); 
    }
    else {
        curViewSelector.find(".btnsScheduleNext").show(); 
    }
    //set schedule navigation buttons with current day and Previous + Next
    var oPrev = new Date();
    oPrev.setTime(activeDay.getTime() - 24 * 3600 * 1000);
    var oNext = new Date();
    oNext.setTime(activeDay.getTime() + 24 * 3600 * 1000);
    curViewSelector.find(".btnsSchedulePrev").attr("value", kendo.toString(kendo.parseDate(oPrev), "yyyy-MM-dd"));
    curViewSelector.find(".btnsScheduleNext").attr("value", kendo.toString(kendo.parseDate(oNext), "yyyy-MM-dd"));
    curViewSelector.find(".btnsSchedule").find(".km-state-active").removeClass("km-state-active");
    curViewSelector.find(".btnsScheduleCur").attr("value", kendo.toString(kendo.parseDate(activeDay), "yyyy-MM-dd")).addClass("km-state-active");
    curViewSelector.find(".btnsScheduleCur").text(kendo.toString(kendo.parseDate(activeDay), "d MMMM"));
    
}

function setScheduleDate() {
    var curViewSelector = app.view().content;
    curViewSelector.find(".oLog").text("").hide();
    //filter events with selected day ones only
    var selDay = $(".btnsSchedule li").eq(this.current().index()).attr("value");
    //get start and end date from html
    var oStart = kendo.parseDate(kendo.toString(kendo.parseDate(curViewSelector.find(".btnsSchedule").attr("data-brsmindate")), "yyyy-MM-dd") + " 00:00");
    var oEnd = kendo.parseDate(kendo.toString(kendo.parseDate(curViewSelector.find(".btnsSchedule").attr("data-brsmaxdate")), "yyyy-MM-dd") + " 23:59");
    //set navigation buttons
    setSchduleButtons(kendo.parseDate(selDay + " 00:00"));
    //filter datasource with selected day, if in range
    if (kendo.parseDate(selDay + " 00:00") >= oStart || kendo.parseDate(selDay + " 23:59") <= oEnd) {
        //scheduleDataSource.filter([{ field: "startDate", operator: "gt", value: kendo.parseDate(selDay + " 00:00") }, { field: "startDate", operator: "lt", value: kendo.parseDate(selDay + " 23:59") }]);
        curViewSelector.find(".scheduleList").data("kendoMobileListView").dataSource.filter({ field: "startDate", operator: "startswith", value: kendo.toString(selDay, "yyyy-MM-dd") }); 
        //$("#scheduleList").data("kendoMobileListView").refresh();
    }
}

function offsetScheduleTime(t){
    //calculate the offset and return the hour based in local server time (geneva)
    var oStr = kendo.toString(kendo.parseDate(t), "HH:mmzzz"); //reads 13:00+02:00
    if (oStr !== undefined && oStr.length == 11) {
        var oOffHour = parseInt(oStr.substr(5, 2));
        var d = new Date(t);
        var res = new Date(d.setHours(d.getHours() + oOffHour));
        return kendo.toString(res, "HH:mm");
    }
    else {
        return kendo.toString(kendo.parseDate(t), "HH:mm");
    }
    
}
