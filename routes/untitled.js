
    // var currentPage = req.query.pageChoose;
    // if(currentPage === undefined){
    //     currentPage=1;
    // }
    
    // Offer.paginate({}, {page: currentPage, limit: 4 }, function(err, result) {
    //     if(err){
    //         console.log(err);
    //     } else {
    //         res.render("offers", {offers: result.docs, pages: result.pages} );
    //     }
    // });



    <style>
.pagination {
    display: inline-block;
}

.pagination a {
    color: white;
    float: left;
    padding: 8px 16px;
    text-decoration: none;
}
</style>
{"$or" : [{"$and": [{"senderA.id" : req.user._id},
                      {"senderB.id" : toUserId}]},
                {"$and": [{"senderA.id" : toUserId},
                      {"senderB.id" : req.user._id}]}]}


                       "author._id":{$ne: ""}
                       ObjectId()




        <div class="pagination">
            <%  for (i = 1; i <= pages; i++) { %>
                <a href="/offers?pageChoose=<%= i %>"><%= i %></a>
            <%  } %>
        </div>