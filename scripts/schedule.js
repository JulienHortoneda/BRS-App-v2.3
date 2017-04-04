var scheduleDataSource; //declare here to be accessible for filtering and other functions
var oStart; 
var oEnd;

(function () {
    window.schedule = {
        init: function() {
            //get view config from url and array
            var UrlParams = extractUrlParams();
            var viewId = UrlParams['vid'];
            if (viewId == undefined) {viewId = 35;}
            var scheduleFeed = "http://informea.pops.int/MobileApp/brsMobileApp2.svc/Schedules";
            var oPrev;
            var oNext;
            var currDay = kendo.parseDate(kendo.toString(kendo.parseDate(new Date()), "yyyy-MM-dd") + " 00:00");
            for (var i = 0; i < viewConfig.length; i++) {
                if (viewConfig[i].vid == parseInt(viewId)) {
                    //remove for v1 - to be implemented in v2 for filtering events for a specific conference - unlikely to have 2 at the same time though
                    //scheduleFeed = scheduleFeed + viewConfig[i].filter;
                    $("#brsHeaderImg img").attr("src", viewConfig[i].logoUrl);
                    this.header.find('[data-role="navbar"]').data('kendoMobileNavBar').title(viewConfig[i].title);
                    oStart = kendo.parseDate(kendo.toString(kendo.parseDate(viewConfig[i].startDate), "yyyy-MM-dd") + " 00:00");
                    oEnd = kendo.parseDate(kendo.toString(kendo.parseDate(viewConfig[i].endDate), "yyyy-MM-dd") + " 23:59");
                    //check if current day in range and point to start day if not
                    if (currDay < oStart || currDay > oEnd) { currDay = oStart; }
                }
            }
            //set dates buttons 
            setSchduleButtons(currDay);
            
            //set datasource for this doc list
            scheduleDataSource = new kendo.data.DataSource({
                serverFiltering: true,
                serverSorting: true,
                serverPaging: true,
                pageSize: 100,
                type: "odata",
                transport: {
                    read: {
                        url: scheduleFeed,
                        dataType: "jsonp"
                    }
                },
                filter: [
                    { field: "startDate", operator: "ge", value: kendo.parseDate(kendo.toString(kendo.parseDate(currDay), "yyyy-MM-dd") + " 00:00") },
                    { field: "startDate", operator: "le", value: kendo.parseDate(kendo.toString(kendo.parseDate(currDay), "yyyy-MM-dd") + " 23:59") }
                ],
                sort: [
                    { field: "startDate", dir: "asc" },
                    { field: "name", dir: "asc" }
                ]
            });
            
            //display docs
            $("#scheduleList").kendoMobileListView({
                dataSource: scheduleDataSource,
                template: $("#schedule-template").html(),
                dataBound: function(e) {
                    //check if no event yet
                    if (this.items().length <= 0) {
                        $("#oLog").append("<p class=\"attentionNote\">No events available for this day.</p>");
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
                        $("#scheduleList").find(".scheduleDescription").hide();
                        $("#scheduleList").find(".km-icon").removeClass("km-arrow-c").addClass("km-arrow-e");
                        //show selected
                        $(e.item).find(".scheduleDescription").show("slow");
                        $(e.item).find(".km-icon").removeClass("km-arrow-e").addClass("km-arrow-c");
                    }
                }
            });
            
        }
    };    
}());

function setSchduleButtons(activeDay) {
    //check if date navigation buttons should be hidden
    if (activeDay <= oStart) { 
        $("#btnsSchedulePrev").hide(); 
    }
    else {
        $("#btnsSchedulePrev").show(); 
    }
    if (kendo.parseDate(kendo.toString(kendo.parseDate(activeDay), "yyyy-MM-dd") + " 23:59") >= oEnd) { 
        $("#btnsScheduleNext").hide(); 
    }
    else {
        $("#btnsScheduleNext").show(); 
    }
    //set schedule navigation buttons with current day and Previous + Next
    var oPrev = new Date();
    oPrev.setTime(activeDay.getTime() - 24 * 3600 * 1000);
    var oNext = new Date();
    oNext.setTime(activeDay.getTime() + 24 * 3600 * 1000);
    $("#btnsSchedulePrev").attr("value", kendo.toString(kendo.parseDate(oPrev), "yyyy-MM-dd"));
    $("#btnsScheduleNext").attr("value", kendo.toString(kendo.parseDate(oNext), "yyyy-MM-dd"));
    $("#btnsSchedule").find(".km-state-active").removeClass("km-state-active");
    $("#btnsScheduleCur").attr("value", kendo.toString(kendo.parseDate(activeDay), "yyyy-MM-dd")).addClass("km-state-active");
    $("#btnsScheduleCur").text(kendo.toString(kendo.parseDate(activeDay), "d MMMM"));
    
}

function setScheduleDate() {
    //filter events with selected day ones only
    var selDay = $("#btnsSchedule li").eq(this.current().index()).attr("value");
    //$("#oLog").append("<p>" + selDay + "</p>");
    //set navigation buttons
    setSchduleButtons(kendo.parseDate(selDay + " 00:00"));
    //filter datasource with selected day, if in range
    if (kendo.parseDate(selDay + " 00:00") >= oStart || kendo.parseDate(selDay + " 23:59") <= oEnd) { 
        scheduleDataSource.filter([{ field: "startDate", operator: "gt", value: kendo.parseDate(selDay + " 00:00") }, { field: "startDate", operator: "lt", value: kendo.parseDate(selDay + " 23:59") }]);
        $("#scheduleList").data("kendoMobileListView").refresh();
    }
}
