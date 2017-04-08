(function () {
    window.news = {
        init: function() {
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //check if newer config is available
                var isOldVersion = isOldConfig(oViewConfig.version);
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set language
                currentLang.value = $("#hdnLang").text();
                //set datasource for this news list
                var newsDataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    serverSorting: true,
                    serverPaging: true,
                    pageSize: 20,
                    type: "odata",
                    transport: {
                        read: {
                            url: oViewConfig.feedUrl,
                            dataType: "jsonp"
                        }
                    },
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

                //display news
                $("#newsList").kendoMobileListView({
                    dataSource: newsDataSource,
                    template: $("#" + oViewConfig.templateId).html(),
                    click: function(e) {
                        //check if article has content that can be displayed within the app or if it should go to an external url
                        //otherwise, do nothing (just an announcement)
                        if (e.dataItem.content !== undefined && e.dataItem.content !== null && e.dataItem.content !== "" && e.dataItem.content !== "&amp;nbsp;" && e.dataItem.content !== "&lt;p&gt;&amp;nbsp;&lt;/p&gt;") {
                            //show in app
                            app.navigate("views/newsDetails.html?vid=" + oViewConfig.id + "&articleId=" + e.dataItem.id);
                        }
                        else {
                            if (e.dataItem.url !== undefined && e.dataItem.url !== null && e.dataItem.url !== "") {
                                navigateToExternalUrl(e.dataItem.url);
                            }
                        }
                        
                    }
                });
            }
        }
    };  
    window.newsdetails = {
        init: function() {
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set language
                currentLang.value = $("#hdnLang").text();
                //var articleId = this.params.articleId;
                if (this.params.articleId !== undefined && this.params.articleId !== null) {
                    //set feed url with filter on the article
                    var newsFeed = "http://informea.pops.int/brsApp3/brsApp.svc/Articles?$filter=id eq " + this.params.articleId;
                    var articleDataSource = new kendo.data.DataSource({
                        serverFiltering: true,
                        serverSorting: true,
                        serverPaging: true,
                        pageSize: 1,
                        type: "odata",
                        transport: {
                            read: {
                                url: newsFeed,
                                dataType: "jsonp"
                            }
                        },
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
                    //display article
                    $("#newsArticle").kendoMobileListView({
                        dataSource: articleDataSource,
                        template: $("#newsArticle-template").html()
                    });
                }
                
                
            }
        }
    };
    window.rssnews = {
        init: function() {
            //get view config from url and array
            var oViewConfig = getViewConfig(this);
            if (oViewConfig !== undefined) {
                //check if newer config is available
                var isOldVersion = isOldConfig(oViewConfig.version);
                //set header and view title
                setHeaderContent(this, oViewConfig);
                //set language
                currentLang.value = $("#hdnLang").text();

                //set datasource for this news list
                var rssDataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: oViewConfig.feedUrl
                        }
                    },
                    schema: {
                        parse: function(data) {
                            //parse to convert date
                            var news = [];
                            for (var i = 0; i < data.length; i++) {
                                var n = {
                                    id: data[i].guid,
                                    title: data[i].title,
                                    description: data[i].description,
                                    link: data[i].link
                                    //pubDate: data[i].pubDate
                                };
                                if (data[i].pubDate !== undefined && data[i].pubDate !== null) {
                                    n.pubDate = new Date(data[i].pubDate);
                                }
                                news.push(n);
                            }
                        return news;
                        }
                    },
                    sort: { field: "pubDate", dir: "desc" }
                });

                //display news
                $("#rssList").kendoMobileListView({
                    dataSource: rssDataSource,
                    template: $("#" + oViewConfig.templateId).html(),
                    click: function(e) {
                        if (e.dataItem.link !== undefined && e.dataItem.link !== null && e.dataItem.link !== "") {
                            navigateToExternalUrl(e.dataItem.link);
                        }
                    }
                });
            }
        }
    };
}());