(function () {
    window.news = {
        init: function() {
            //$("#oLog").append("<p>show function</p>");
            //get view config from url and array
            var UrlParams = extractUrlParams();
            var viewId = UrlParams['vid'];
            if (viewId == undefined) {viewId = 1;}
            var newsFeed = "http://informea.pops.int/MobileApp/brsMobileApp2.svc/Articles?";
            for (var i = 0; i < viewConfig.length; i++) {
                if (viewConfig[i].vid == parseInt(viewId)) {
                    newsFeed = newsFeed + viewConfig[i].filter;
                    this.header.find('[data-role="navbar"]').data('kendoMobileNavBar').title(viewConfig[i].title);
                }
            }
            var oTemplate = "newsListNoPic-template";
            if (viewId == 31) {oTemplate = "newsListWithPic-template"}
            //set datasource for this news list
            newsDataSource = new kendo.data.DataSource({
                serverFiltering: true,
                serverSorting: true,
                serverPaging: true,
                pageSize: 20,
                type: "odata",
                transport: {
                    read: {
                        url: newsFeed,
                        dataType: "jsonp"
                    }
                },
                sort: { field: "dateCreated", dir: "desc" }
            });
            
            //display news
            $("#newsList").kendoMobileListView({
                dataSource: newsDataSource,
                template: $("#" + oTemplate).html(),
                click: function(e) {
                    //navigate to other views, if url is set 
                    if ($(e.item).find(".newsUrl").text().length > 0) {
                        if ($(e.item).find(".newsUrl").text().indexOf("mobileapp://") >= 0) {
                            //mobile app specific annoucements to navigation inside the app
                            app.navigate($(e.item).find(".newsUrl").text().replace("mobileapp://", ""));
                        }
                        else {
                            //external navigation if content is empty
                            if ($(e.item).find(".newsContent").text().trim() !== "yes") {
                                //open in browser
                                window.open($(e.item).find(".newsUrl").text(), '_blank');
                            }
                            else {
                                //open view with full article (article id is div text) - layout is lost!!!
                                app.navigate("views/newsDetails.html?articleId=" + $(e.item).find(".newsId").text());
                                //window.open($(e.item).find(".newsUrl").text(), '_blank');
                            }
                        }
                    }
                }
            });   
        }
    };  
    window.newsdetails = {
        init: function() {
            //get article id 
            var UrlParams = extractUrlParams();
            var articleId = UrlParams['articleId'];
            if (articleId == undefined) {articleId = 1;}
            var newsFeed = "http://informea.pops.int/MobileApp/brsMobileApp2.svc/Articles?$filter=id eq " + articleId;
            this.header.find('[data-role="navbar"]').data('kendoMobileNavBar').title("News");
            //set datasource
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
                sort: { field: "dateCreated", dir: "desc" }
            });
            //display article
            $("#newsArticle").kendoMobileListView({
                dataSource: articleDataSource,
                template: $("#newsArticle-template").html()
            });
        }
    };
}());